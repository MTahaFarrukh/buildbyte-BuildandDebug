from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from config import get_settings
from prompts.templates import CAREER_MENTOR_PROMPT, RAG_MENTOR_PROMPT
from schemas.models import ChatRequest, ChatResponse
from services.ai_service import ai_service
from services.demo_data import demo_chat_reply
from services.rag_service import rag_service, user_collection_id
from utils.helpers import format_chat_history

router = APIRouter(prefix="/chat", tags=["Career Chat"])


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def career_chat(payload: ChatRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = [{"role": m.role, "content": m.content} for m in payload.chat_history]
    collection_id = getattr(payload, "collection_id", None) or ""
    user_memory = payload.user_context or "Student exploring career options"

    settings = get_settings()
    retrieved_context = "No retrieved documents."
    used_rag = False

    coll = (payload.collection_id or "").strip()
    if not coll and "collection_id:" in user_memory:
        for line in user_memory.splitlines():
            if line.strip().startswith("collection_id:"):
                coll = line.split(":", 1)[1].strip()
                break

    if coll:
        try:
            chunks = rag_service.retrieve(coll, payload.message, k=5)
            retrieved_context = rag_service.format_context(chunks)
            used_rag = bool(chunks)
        except Exception:
            retrieved_context = "Retrieval unavailable."

    try:
        if settings.groq_api_key:
            if used_rag or coll:
                prompt = RAG_MENTOR_PROMPT.format(
                    user_memory=user_memory,
                    retrieved_context=retrieved_context,
                    chat_history=format_chat_history(history),
                    message=payload.message,
                )
                reply = await ai_service.generate_text(
                    prompt,
                    system="You are CareerGPS RAG Mentor. Ground answers in retrieved context.",
                )
            else:
                prompt = CAREER_MENTOR_PROMPT.format(
                    user_context=user_memory,
                    chat_history=format_chat_history(history),
                    message=payload.message,
                )
                reply = await ai_service.generate_text(
                    prompt,
                    system="You are CareerGPS AI Mentor — supportive, practical, memorable.",
                )
        else:
            reply = demo_chat_reply(payload.message)
            if used_rag:
                reply = f"(RAG context loaded)\n\n{reply}"
    except Exception:
        reply = demo_chat_reply(payload.message)

    return ChatResponse(reply=reply)


@router.post("/rag")
async def rag_chat(payload: ChatRequest):
    """Explicit RAG endpoint — same as chat but forces retrieval when collection_id in context."""
    return await career_chat(payload)


@router.post("/upload-pdf")
async def upload_mentor_pdf(
    file: UploadFile = File(...),
    user_id: str = Form(default="demo_user"),
    source: str = Form(default="mentor"),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    content = await file.read()
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 15MB)")

    collection_id = user_collection_id(user_id)
    try:
        result = rag_service.ingest_pdf_bytes(
            collection_id,
            content,
            filename=file.filename,
            source=source or "mentor",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to embed PDF: {e}") from e

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error") or "Ingest failed")

    return {
        "success": True,
        "collection_id": collection_id,
        **result,
        "message": f"Embedded {result.get('chunks', 0)} chunks from {file.filename}",
    }
