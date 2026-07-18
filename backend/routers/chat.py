from fastapi import APIRouter, HTTPException

from config import get_settings
from prompts.templates import CAREER_MENTOR_PROMPT
from schemas.models import ChatRequest, ChatResponse
from services.ai_service import ai_service
from services.demo_data import demo_chat_reply
from utils.helpers import format_chat_history

router = APIRouter(prefix="/chat", tags=["Career Chat"])


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def career_chat(payload: ChatRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = [{"role": m.role, "content": m.content} for m in payload.chat_history]
    prompt = CAREER_MENTOR_PROMPT.format(
        user_context=payload.user_context or "Student exploring career options",
        chat_history=format_chat_history(history),
        message=payload.message,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            reply = await ai_service.generate_text(
                prompt,
                system="You are CareerGPS AI Mentor — supportive, practical, memorable.",
            )
        else:
            reply = demo_chat_reply(payload.message)
    except Exception:
        reply = demo_chat_reply(payload.message)

    return ChatResponse(reply=reply)
