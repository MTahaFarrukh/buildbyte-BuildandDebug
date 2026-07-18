from fastapi import APIRouter, HTTPException

from config import get_settings
from prompts.templates import JOB_ANALYSIS_PROMPT
from schemas.models import JobAnalyzeRequest
from services.ai_service import ai_service
from services.demo_data import demo_job_analysis
from utils.helpers import truncate_text

router = APIRouter(prefix="/job", tags=["Job Analysis"])


@router.post("/analyze")
async def analyze_job(payload: JobAnalyzeRequest):
    if len(payload.job_description.strip()) < 50:
        raise HTTPException(status_code=400, detail="Job description is too short")
    if len(payload.resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short")

    prompt = JOB_ANALYSIS_PROMPT.format(
        resume_text=truncate_text(payload.resume_text),
        job_description=truncate_text(payload.job_description, 8000),
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI job match analyst. Return valid JSON only.",
            )
        else:
            result = demo_job_analysis(payload.job_description)
    except Exception:
        result = demo_job_analysis(payload.job_description)

    return {"success": True, **result}
