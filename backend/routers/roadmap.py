from fastapi import APIRouter

from config import get_settings
from prompts.templates import ROADMAP_PROMPT
from schemas.models import RoadmapRequest
from services.ai_service import ai_service
from services.demo_data import demo_roadmap
from services.roadmap_derive import derive_weekly_from_monthly

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

CAREER_PATHS = [
    "AI Engineer",
    "Data Scientist",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Cybersecurity Analyst",
    "DevOps Engineer",
    "Mobile Developer",
    "Product Manager",
    "Machine Learning Engineer",
    "Cloud Engineer",
    "UI/UX Designer",
]


@router.get("/paths")
async def list_paths():
    return {"paths": CAREER_PATHS}


@router.post("/generate")
async def generate_roadmap(payload: RoadmapRequest):
    prompt = ROADMAP_PROMPT.format(
        career_path=payload.career_path,
        current_level=payload.current_level,
        background=payload.background or "Student / early career",
        hours_per_week=payload.hours_per_week,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system=(
                    "You are CareerGPS AI roadmap architect. "
                    "Generate MONTHLY roadmap with topics only. Never invent independent weeks. Return valid JSON only."
                ),
            )
        else:
            result = demo_roadmap(payload.career_path, payload.current_level)
    except Exception:
        result = demo_roadmap(payload.career_path, payload.current_level)

    # Always derive weekly from monthly (source of truth)
    result = derive_weekly_from_monthly(result, hours_per_week=payload.hours_per_week)
    return {"success": True, **result}
