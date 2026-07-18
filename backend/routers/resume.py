import uuid
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from database.supabase_client import get_memory_store, is_supabase_configured, get_supabase_admin
from prompts.templates import RESUME_ANALYSIS_PROMPT, RESUME_REWRITE_PROMPT
from schemas.models import ResumeAnalyzeRequest, ResumeRewriteRequest
from services.ai_service import ai_service
from services.demo_data import demo_resume_analysis
from utils.helpers import extract_text_from_pdf, truncate_text
from config import get_settings

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form(default="demo_user"),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        text = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {e}") from e

    if not text or len(text) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract enough text from PDF. Try a text-based resume.",
        )

    resume_id = str(uuid.uuid4())
    record = {
        "id": resume_id,
        "user_id": user_id,
        "filename": file.filename,
        "text": text,
        "storage_path": None,
    }

    # Optional Supabase storage
    if is_supabase_configured():
        try:
            admin = get_supabase_admin()
            path = f"resumes/{user_id}/{resume_id}.pdf"
            admin.storage.from_("resumes").upload(
                path, content, {"content-type": "application/pdf"}
            )
            record["storage_path"] = path
        except Exception:
            pass  # continue without storage

    store = get_memory_store()
    store["resumes"][resume_id] = record
    store.setdefault("user_resumes", {}).setdefault(user_id, []).append(resume_id)

    return {
        "success": True,
        "resume_id": resume_id,
        "filename": file.filename,
        "text_preview": text[:500],
        "char_count": len(text),
        "message": "Resume uploaded and text extracted successfully",
    }


@router.post("/analyze")
async def analyze_resume(payload: ResumeAnalyzeRequest):
    store = get_memory_store()
    resume_text = payload.resume_text or ""

    if payload.resume_id and payload.resume_id in store["resumes"]:
        resume_text = store["resumes"][payload.resume_id]["text"]

    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is required")

    resume_text = truncate_text(resume_text)
    target_role = payload.target_role or "Software Engineer"
    prompt = RESUME_ANALYSIS_PROMPT.format(
        resume_text=resume_text, target_role=target_role
    )

    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI resume analyst. Always return valid JSON only.",
            )
        else:
            result = demo_resume_analysis(resume_text, target_role)
    except Exception:
        result = demo_resume_analysis(resume_text, target_role)

    analysis_id = str(uuid.uuid4())
    store["analyses"][analysis_id] = result
    return {"success": True, "analysis_id": analysis_id, **result}


@router.post("/rewrite")
async def rewrite_resume(payload: ResumeRewriteRequest):
    prompt = RESUME_REWRITE_PROMPT.format(
        resume_text=truncate_text(payload.resume_text),
        target_role=payload.target_role,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI resume writer. Return valid JSON only.",
            )
        else:
            analysis = demo_resume_analysis(payload.resume_text, payload.target_role)
            result = {
                "rewritten_summary": analysis["rewritten_summary"],
                "rewritten_experience": [],
                "rewritten_projects": [],
                "skills_section": {
                    "technical": analysis["extracted_skills"],
                    "tools": [],
                    "soft": ["Communication", "Teamwork"],
                },
                "ats_keywords_added": analysis["extracted_skills"][:5],
                "changes_made": ["Improved summary", "ATS keyword alignment"],
                "full_rewritten_text": analysis["rewritten_summary"]
                + "\n\n"
                + "\n".join(analysis["ats_optimized_bullets"]),
                "_demo_mode": True,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    return {"success": True, **result}


@router.get("/list/{user_id}")
async def list_resumes(user_id: str) -> dict[str, Any]:
    store = get_memory_store()
    ids = store.get("user_resumes", {}).get(user_id, [])
    resumes = []
    for rid in ids:
        r = store["resumes"].get(rid)
        if r:
            resumes.append(
                {
                    "id": r["id"],
                    "filename": r["filename"],
                    "char_count": len(r.get("text", "")),
                    "storage_path": r.get("storage_path"),
                }
            )
    return {"resumes": resumes}
