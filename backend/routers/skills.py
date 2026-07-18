from fastapi import APIRouter

from config import get_settings
from prompts.templates import SKILL_GAP_PROMPT
from schemas.models import SkillGapRequest
from services.ai_service import ai_service
from services.demo_data import demo_skill_gap

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.post("/analyze")
async def analyze_skills(payload: SkillGapRequest):
    prompt = SKILL_GAP_PROMPT.format(
        current_skills=", ".join(payload.current_skills) or "None listed",
        target_role=payload.target_role,
        experience=payload.experience,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI skills analyst. Return valid JSON only.",
            )
        else:
            result = demo_skill_gap(payload.target_role, payload.current_skills)
    except Exception:
        result = demo_skill_gap(payload.target_role, payload.current_skills)

    return {"success": True, **result}
