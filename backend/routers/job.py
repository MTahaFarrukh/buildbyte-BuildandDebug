from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from config import get_settings
from database.supabase_client import get_memory_store
from prompts.templates import JOB_ANALYSIS_PROMPT, INTERVIEW_PROMPT, SKILL_GAP_PROMPT
from schemas.models import JobAnalyzeRequest
from services.ai_service import ai_service
from services.demo_data import demo_interview, demo_job_analysis, demo_skill_gap
from services.rag_service import rag_service, user_collection_id
from utils.helpers import extract_text_from_pdf, truncate_text

router = APIRouter(prefix="/job", tags=["Job Analysis"])


async def _analyze_texts(resume_text: str, job_description: str) -> dict:
    if len(job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description is too short")
    if len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume PDF text is missing or too short")

    prompt = JOB_ANALYSIS_PROMPT.format(
        resume_text=truncate_text(resume_text),
        job_description=truncate_text(job_description, 8000),
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI job match analyst. Return valid JSON only.",
            )
        else:
            result = demo_job_analysis(job_description)
    except Exception:
        result = demo_job_analysis(job_description)
    return result


@router.post("/analyze")
async def analyze_job(payload: JobAnalyzeRequest):
    result = await _analyze_texts(payload.resume_text, payload.job_description)
    return {"success": True, **result}


@router.post("/analyze-pdf")
async def analyze_job_pdf(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    user_id: str = Form(default="demo_user"),
    target_role: str = Form(default="Software Engineer"),
):
    """Preferred UX: upload resume PDF + paste JD."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a resume PDF")
    if len(job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description is too short")

    content = await file.read()
    try:
        resume_text = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {e}") from e

    if len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Could not extract enough text from resume PDF")

    # Store + embed for RAG
    store = get_memory_store()
    collection_id = user_collection_id(user_id)
    try:
        rag_service.ingest_text(
            collection_id, resume_text, source="resume", filename=file.filename or "resume.pdf"
        )
        rag_service.ingest_text(
            collection_id, job_description, source="job", filename="job_description.txt"
        )
    except Exception:
        pass

    match = await _analyze_texts(resume_text, job_description)

    # Skill gap from match missing skills
    missing = match.get("missing_skills") or []
    current = match.get("matching_skills") or []
    settings = get_settings()
    try:
        if settings.groq_api_key:
            skill_prompt = SKILL_GAP_PROMPT.format(
                current_skills=", ".join(current) or "From resume",
                target_role=target_role,
                experience="Inferred from resume vs JD",
            )
            skill_gap = await ai_service.generate_json(skill_prompt)
        else:
            skill_gap = demo_skill_gap(target_role, current)
    except Exception:
        skill_gap = demo_skill_gap(target_role, current)

    try:
        if settings.groq_api_key:
            interview = await ai_service.generate_json(
                INTERVIEW_PROMPT.format(
                    role=target_role,
                    experience_level="entry",
                    focus_areas=", ".join((match.get("interview_focus_areas") or [])[:5]) or "general",
                )
            )
        else:
            interview = demo_interview(target_role)
    except Exception:
        interview = demo_interview(target_role)

    readiness = int(
        round(
            (int(match.get("match_percentage") or 0) * 0.5)
            + (int(skill_gap.get("overall_readiness") or 40) * 0.5)
        )
    )

    store.setdefault("job_prep", {})[user_id] = {
        "resume_text": resume_text,
        "job_description": job_description,
        "match": match,
        "skill_gap": skill_gap,
        "interview": interview,
    }

    return {
        "success": True,
        "resume_text": resume_text,
        "resume_text_preview": resume_text[:400],
        "resume_char_count": len(resume_text),
        "filename": file.filename,
        "collection_id": collection_id,
        "match": match,
        "skill_gap": skill_gap,
        "interview": interview,
        "interview_readiness": readiness,
        "ats_notes": match.get("suggested_improvements") or [],
        "recommended_improvements": match.get("suggested_improvements") or [],
    }
