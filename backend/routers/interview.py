from fastapi import APIRouter

from config import get_settings
from prompts.templates import INTERVIEW_PROMPT
from schemas.models import InterviewRequest
from services.ai_service import ai_service
from services.demo_data import demo_interview

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/generate")
async def generate_interview(payload: InterviewRequest):
    prompt = INTERVIEW_PROMPT.format(
        role=payload.role,
        experience_level=payload.experience_level,
        focus_areas=payload.focus_areas,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI interview coach. Return valid JSON only.",
            )
        else:
            result = demo_interview(payload.role)
    except Exception:
        result = demo_interview(payload.role)

    return {"success": True, **result}
