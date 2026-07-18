from fastapi import APIRouter

from config import get_settings
from prompts.templates import PLANNER_PROMPT
from schemas.models import PlannerRequest
from services.ai_service import ai_service
from services.demo_data import demo_planner

router = APIRouter(prefix="/planner", tags=["Planner"])


@router.post("")
@router.post("/")
async def create_plan(payload: PlannerRequest):
    prompt = PLANNER_PROMPT.format(
        goal=payload.goal,
        hours_per_day=payload.hours_per_day,
        career_path=payload.career_path,
        current_skills=", ".join(payload.current_skills) or "General",
        weak_areas=", ".join(payload.weak_areas) or "To be assessed",
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI learning planner. Return valid JSON only.",
            )
        else:
            result = demo_planner(payload.goal, payload.career_path)
    except Exception:
        result = demo_planner(payload.goal, payload.career_path)

    return {"success": True, **result}
