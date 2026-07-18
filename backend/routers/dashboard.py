from fastapi import APIRouter, HTTPException

from database.supabase_client import get_memory_store
from schemas.models import DashboardUpdate, ProfileUpdate

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _default_profile(user_id: str) -> dict:
    return {
        "id": user_id,
        "email": f"{user_id}@demo.local",
        "full_name": "Career Explorer",
        "career_path": "Software Engineer",
        "career_score": 42,
        "theme": "dark",
        "notifications_enabled": True,
        "badges": ["newcomer", "explorer"],
        "completed_skills": ["Git", "HTML/CSS"],
        "skills": ["Python", "JavaScript", "Git", "HTML/CSS", "React"],
        "learning_hours": 18,
        "projects_built": 2,
        "resume_improvements": 1,
        "weekly_goal": "Finish skill gap analysis & start Week 1 roadmap",
        "roadmap_progress": 28,
        "upcoming_tasks": [
            {"id": "1", "title": "Upload & analyze resume", "due": "Today", "done": False},
            {"id": "2", "title": "Generate career roadmap", "due": "Tomorrow", "done": False},
            {"id": "3", "title": "Practice 2 coding problems", "due": "This week", "done": False},
            {"id": "4", "title": "Review missing skills", "due": "This week", "done": False},
        ],
        "recommended_skills": ["System Design", "TypeScript", "Docker", "SQL", "Testing"],
        "weekly_activity": [
            {"day": "Mon", "hours": 1.5},
            {"day": "Tue", "hours": 2.0},
            {"day": "Wed", "hours": 0.5},
            {"day": "Thu", "hours": 2.5},
            {"day": "Fri", "hours": 1.0},
            {"day": "Sat", "hours": 3.0},
            {"day": "Sun", "hours": 1.5},
        ],
        "analytics": {
            "career_progress": [
                {"week": "W1", "score": 30},
                {"week": "W2", "score": 35},
                {"week": "W3", "score": 38},
                {"week": "W4", "score": 42},
            ],
            "skills_completed_monthly": [
                {"month": "Jan", "count": 2},
                {"month": "Feb", "count": 3},
                {"month": "Mar", "count": 4},
                {"month": "Apr", "count": 5},
            ],
            "learning_hours_monthly": [
                {"month": "Jan", "hours": 8},
                {"month": "Feb", "hours": 12},
                {"month": "Mar", "hours": 15},
                {"month": "Apr", "hours": 18},
            ],
            "projects_timeline": [
                {"month": "Jan", "count": 0},
                {"month": "Feb", "count": 1},
                {"month": "Mar", "count": 1},
                {"month": "Apr", "count": 2},
            ],
            "resume_scores": [
                {"date": "Week 1", "score": 45},
                {"date": "Week 2", "score": 52},
                {"date": "Week 3", "score": 58},
                {"date": "Week 4", "score": 65},
            ],
        },
    }


@router.get("")
@router.get("/")
@router.get("/{user_id}")
async def get_dashboard(user_id: str = "demo_user"):
    store = get_memory_store()
    profile = store["profiles"].get(user_id)
    if not profile:
        profile = _default_profile(user_id)
        store["profiles"][user_id] = profile
    return {"success": True, "dashboard": profile}


@router.patch("/{user_id}")
async def update_dashboard(user_id: str, payload: DashboardUpdate):
    store = get_memory_store()
    profile = store["profiles"].get(user_id) or _default_profile(user_id)
    data = payload.model_dump(exclude_none=True)
    profile.update(data)
    store["profiles"][user_id] = profile
    return {"success": True, "dashboard": profile}


@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    store = get_memory_store()
    profile = store["profiles"].get(user_id) or _default_profile(user_id)
    return {"success": True, "profile": profile}


@router.patch("/profile/{user_id}")
async def update_profile(user_id: str, payload: ProfileUpdate):
    store = get_memory_store()
    profile = store["profiles"].get(user_id) or _default_profile(user_id)
    profile.update(payload.model_dump(exclude_none=True))
    store["profiles"][user_id] = profile
    return {"success": True, "profile": profile}


@router.delete("/account/{user_id}")
async def delete_account(user_id: str):
    store = get_memory_store()
    store["profiles"].pop(user_id, None)
    store["users"].pop(user_id, None)
    store["chats"].pop(user_id, None)
    return {"success": True, "message": "Account deleted"}


@router.post("/badges/{user_id}/{badge}")
async def award_badge(user_id: str, badge: str):
    store = get_memory_store()
    profile = store["profiles"].get(user_id) or _default_profile(user_id)
    badges = profile.setdefault("badges", [])
    if badge not in badges:
        badges.append(badge)
    store["profiles"][user_id] = profile
    return {"success": True, "badges": badges}
