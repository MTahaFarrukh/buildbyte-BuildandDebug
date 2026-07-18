from typing import Any, Optional

from supabase import Client, create_client

from config import get_settings

_client: Optional[Client] = None
_admin_client: Optional[Client] = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.supabase_url or not settings.supabase_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY must be set in backend/.env"
            )
        _client = create_client(settings.supabase_url, settings.supabase_key)
    return _client


def get_supabase_admin() -> Client:
    global _admin_client
    if _admin_client is None:
        settings = get_settings()
        key = settings.supabase_service_key or settings.supabase_key
        if not settings.supabase_url or not key:
            raise ValueError("SUPABASE_URL and keys must be set in backend/.env")
        _admin_client = create_client(settings.supabase_url, key)
    return _admin_client


def is_supabase_configured() -> bool:
    settings = get_settings()
    return bool(settings.supabase_url and settings.supabase_key)


# In-memory fallback store when Supabase is not configured (local demo mode)
_memory_store: dict[str, Any] = {
    "users": {},
    "resumes": {},
    "analyses": {},
    "roadmaps": {},
    "chats": {},
    "profiles": {},
    "dashboard": {},
}


def get_memory_store() -> dict[str, Any]:
    return _memory_store
