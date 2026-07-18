import json
import re
from typing import Any, Optional

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from config import get_settings


class AIService:
    """Reusable Groq / Llama 3.3 70B service with structured JSON parsing."""

    def __init__(self) -> None:
        settings = get_settings()
        self.model_name = settings.groq_model
        self.api_key = settings.groq_api_key
        self._llm: Optional[ChatGroq] = None

    @property
    def llm(self) -> ChatGroq:
        if self._llm is None:
            if not self.api_key:
                raise ValueError(
                    "GROQ_API_KEY is not set. Add it to backend/.env to enable AI features."
                )
            self._llm = ChatGroq(
                groq_api_key=self.api_key,
                model_name=self.model_name,
                temperature=0.35,
                max_tokens=8192,
            )
        return self._llm

    def _extract_json(self, text: str) -> dict[str, Any]:
        text = text.strip()
        # Strip markdown fences
        fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if fence:
            text = fence.group(1).strip()
        # Find outermost JSON object
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1:
            raise ValueError("No JSON object found in AI response")
        return json.loads(text[start : end + 1])

    async def generate_json(self, prompt: str, system: str | None = None) -> dict[str, Any]:
        messages = []
        if system:
            messages.append(SystemMessage(content=system))
        messages.append(HumanMessage(content=prompt))
        response = await self.llm.ainvoke(messages)
        content = response.content if isinstance(response.content, str) else str(response.content)
        return self._extract_json(content)

    async def generate_text(self, prompt: str, system: str | None = None) -> str:
        messages = []
        if system:
            messages.append(SystemMessage(content=system))
        messages.append(HumanMessage(content=prompt))
        response = await self.llm.ainvoke(messages)
        return response.content if isinstance(response.content, str) else str(response.content)

    def generate_json_sync(self, prompt: str, system: str | None = None) -> dict[str, Any]:
        messages = []
        if system:
            messages.append(SystemMessage(content=system))
        messages.append(HumanMessage(content=prompt))
        response = self.llm.invoke(messages)
        content = response.content if isinstance(response.content, str) else str(response.content)
        return self._extract_json(content)


ai_service = AIService()
