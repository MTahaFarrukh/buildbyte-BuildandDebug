import base64
import re
import uuid
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from config import get_settings
from database.supabase_client import get_memory_store, get_supabase_admin, is_supabase_configured
from prompts.templates import RESUME_ANALYSIS_PROMPT, RESUME_BUILD_PROMPT, RESUME_REWRITE_PROMPT
from schemas.models import (
    ResumeAnalyzeRequest,
    ResumeBuildRequest,
    ResumePdfRequest,
    ResumeRewriteRequest,
)
from services.ai_service import ai_service
from services.demo_data import demo_resume_analysis
from services.pdf_resume import plain_text_resume_to_pdf, structured_resume_to_pdf
from utils.helpers import extract_text_from_pdf, truncate_text

router = APIRouter(prefix="/resume", tags=["Resume"])


def _slug(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "_", name.strip()) or "Resume"
    return cleaned.strip("_")[:40]


def _attach_pdf(result: dict[str, Any], *, full_name: str, target_role: str) -> dict[str, Any]:
    try:
        contact = result.get("contact") or {}
        name = contact.get("name") or full_name or "Resume"
        pdf_bytes = structured_resume_to_pdf(result)
        if len(pdf_bytes) < 100 and result.get("full_rewritten_text"):
            pdf_bytes = plain_text_resume_to_pdf(
                result["full_rewritten_text"],
                name=name,
                target_role=target_role,
            )
        filename = f"CareerGPS_{_slug(name)}_{_slug(target_role)}.pdf"
        result["pdf_base64"] = base64.b64encode(pdf_bytes).decode("ascii")
        result["pdf_filename"] = filename
        result["pdf_size_bytes"] = len(pdf_bytes)
    except Exception as e:
        result["pdf_error"] = str(e)
    return result


def _demo_build(payload: ResumeBuildRequest) -> dict[str, Any]:
    skills = [s.strip() for s in payload.skills.split(",") if s.strip()] or [
        "Problem Solving",
        "Communication",
        "Git",
    ]
    return {
        "contact": {
            "name": payload.full_name,
            "email": payload.email,
            "phone": payload.phone,
            "location": payload.location,
            "linkedin": payload.linkedin,
            "github": payload.github,
            "portfolio": payload.portfolio,
        },
        "rewritten_summary": (
            f"Motivated aspiring {payload.target_role} with a strong foundation in "
            f"{', '.join(skills[:3])}. Eager to contribute to high-impact teams while "
            "growing technical depth through projects and continuous learning."
        ),
        "rewritten_experience": [
            {
                "title": "Intern / Project Contributor",
                "company": "Academic / Personal Projects",
                "dates": "Recent",
                "bullets": [
                    f"Built projects aligned with {payload.target_role} responsibilities",
                    "Collaborated using Git and documented work clearly",
                    "Improved outcomes through iteration and feedback",
                ],
            }
        ]
        if payload.experience
        else [],
        "education": [
            {
                "degree": payload.education.split("\n")[0] if payload.education else "Bachelor's Degree",
                "school": "University",
                "year": "Present",
                "details": "",
            }
        ],
        "rewritten_projects": [
            {
                "name": "Portfolio Project",
                "bullets": [
                    payload.projects.split("\n")[0]
                    if payload.projects
                    else f"Developed a project showcasing {payload.target_role} skills",
                    "Documented architecture and deployed a demo",
                ],
                "tech_stack": skills[:4],
            }
        ],
        "skills_section": {
            "technical": skills[:8],
            "tools": ["Git", "VS Code"],
            "soft": ["Communication", "Teamwork", "Ownership"],
        },
        "certifications": [],
        "full_rewritten_text": "",
        "tips": [
            "Add metrics to every bullet",
            "Mirror keywords from job descriptions",
            "Keep to one page if under 3 years experience",
        ],
        "_demo_mode": True,
    }


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

    if is_supabase_configured():
        try:
            admin = get_supabase_admin()
            path = f"resumes/{user_id}/{resume_id}.pdf"
            admin.storage.from_("resumes").upload(
                path, content, {"content-type": "application/pdf"}
            )
            record["storage_path"] = path
        except Exception:
            pass

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
                "contact": {
                    "name": payload.full_name or "Candidate",
                    "email": "",
                    "phone": "",
                    "location": "",
                    "linkedin": "",
                    "github": "",
                    "portfolio": "",
                },
                "rewritten_summary": analysis["rewritten_summary"],
                "rewritten_experience": [
                    {
                        "title": payload.target_role,
                        "company": "Relevant Experience",
                        "dates": "",
                        "bullets": analysis["ats_optimized_bullets"],
                    }
                ],
                "education": [],
                "rewritten_projects": [],
                "skills_section": {
                    "technical": analysis["extracted_skills"],
                    "tools": [],
                    "soft": ["Communication", "Teamwork"],
                },
                "certifications": [],
                "ats_keywords_added": analysis["extracted_skills"][:5],
                "changes_made": ["Improved summary", "ATS keyword alignment", "PDF-ready structure"],
                "full_rewritten_text": analysis["rewritten_summary"]
                + "\n\n"
                + "\n".join(analysis["ats_optimized_bullets"]),
                "_demo_mode": True,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    if payload.full_name and not (result.get("contact") or {}).get("name"):
        result.setdefault("contact", {})["name"] = payload.full_name

    if payload.generate_pdf:
        result = _attach_pdf(
            result,
            full_name=payload.full_name or "Resume",
            target_role=payload.target_role,
        )

    return {"success": True, **result}


@router.post("/build")
async def build_resume(payload: ResumeBuildRequest):
    if not payload.full_name.strip():
        raise HTTPException(status_code=400, detail="Full name is required")

    prompt = RESUME_BUILD_PROMPT.format(
        full_name=payload.full_name,
        email=payload.email or "",
        phone=payload.phone or "",
        location=payload.location or "",
        linkedin=payload.linkedin or "",
        github=payload.github or "",
        portfolio=payload.portfolio or "",
        target_role=payload.target_role,
        education=payload.education or "Not provided",
        experience=payload.experience or "Not provided",
        projects=payload.projects or "Not provided",
        skills=payload.skills or "Not provided",
        notes=payload.notes or "None",
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI resume builder. Return valid JSON only.",
            )
        else:
            result = _demo_build(payload)
    except Exception:
        result = _demo_build(payload)

    # Ensure contact reflects user-entered details
    contact = result.setdefault("contact", {})
    contact["name"] = payload.full_name
    if payload.email:
        contact["email"] = payload.email
    if payload.phone:
        contact["phone"] = payload.phone
    if payload.location:
        contact["location"] = payload.location
    if payload.linkedin:
        contact["linkedin"] = payload.linkedin
    if payload.github:
        contact["github"] = payload.github
    if payload.portfolio:
        contact["portfolio"] = payload.portfolio

    if payload.generate_pdf:
        result = _attach_pdf(
            result,
            full_name=payload.full_name,
            target_role=payload.target_role,
        )

    return {"success": True, **result}


@router.post("/pdf")
async def generate_resume_pdf(payload: ResumePdfRequest):
    if payload.structured:
        pdf_bytes = structured_resume_to_pdf(payload.structured)
    elif payload.plain_text and payload.plain_text.strip():
        pdf_bytes = plain_text_resume_to_pdf(
            payload.plain_text,
            name=payload.full_name,
            target_role=payload.target_role,
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide structured resume JSON or plain_text",
        )

    filename = payload.filename or "CareerGPS_Resume.pdf"
    if not filename.lower().endswith(".pdf"):
        filename += ".pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


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
