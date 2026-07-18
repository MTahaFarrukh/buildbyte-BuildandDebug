from fastapi import APIRouter

from config import get_settings
from prompts.templates import PROJECT_GENERATOR_PROMPT
from schemas.models import ProjectGenerateRequest
from services.ai_service import ai_service
from services.demo_data import demo_projects

router = APIRouter(prefix="/project", tags=["Projects"])


@router.post("/generate")
async def generate_projects(payload: ProjectGenerateRequest):
    count = max(1, min(payload.count, 5))
    prompt = PROJECT_GENERATOR_PROMPT.format(
        count=count,
        skill_level=payload.skill_level,
        career_path=payload.career_path,
        interests=payload.interests or "general software projects",
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(
                prompt,
                system="You are CareerGPS AI project mentor. Return valid JSON only.",
            )
        else:
            result = demo_projects(payload.career_path, payload.skill_level, count)
    except Exception:
        result = demo_projects(payload.career_path, payload.skill_level, count)

    return {"success": True, **result}
