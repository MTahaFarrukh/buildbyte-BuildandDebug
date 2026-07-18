from typing import Any, Optional
from pydantic import BaseModel, Field


# ─── Common ───────────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    detail: str
    success: bool = False


# ─── Auth ─────────────────────────────────────────────────────────────────────

class AuthSignup(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    career_path: Optional[str] = None


class AuthLogin(BaseModel):
    email: str
    password: str


class AuthForgotPassword(BaseModel):
    email: str


class AuthResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    user: Optional[dict[str, Any]] = None
    message: str = "Success"


# ─── Resume ───────────────────────────────────────────────────────────────────

class ResumeAnalyzeRequest(BaseModel):
    resume_text: Optional[str] = None
    target_role: Optional[str] = "Software Engineer"
    resume_id: Optional[str] = None


class SuggestionItem(BaseModel):
    category: str
    priority: str
    suggestion: str


class ResumeAnalysisResult(BaseModel):
    overall_score: int = 0
    ats_score: int = 0
    formatting_score: int = 0
    grammar_score: int = 0
    projects_score: int = 0
    experience_score: int = 0
    education_score: int = 0
    skills_score: int = 0
    career_confidence_score: int = 0
    summary: str = ""
    strengths: list[str] = []
    weaknesses: list[str] = []
    suggestions: list[dict[str, Any]] = []
    extracted_skills: list[str] = []
    rewritten_summary: str = ""
    ats_optimized_bullets: list[str] = []


class ResumeRewriteRequest(BaseModel):
    resume_text: str
    target_role: str = "Software Engineer"
    full_name: Optional[str] = None
    generate_pdf: bool = True


class ResumeBuildRequest(BaseModel):
    full_name: str
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    target_role: str = "Software Engineer"
    education: str = ""
    experience: str = ""
    projects: str = ""
    skills: str = ""
    notes: str = ""
    generate_pdf: bool = True


class ResumePdfRequest(BaseModel):
    """Generate a PDF from structured rewrite/build JSON or plain text."""

    structured: Optional[dict[str, Any]] = None
    plain_text: Optional[str] = None
    full_name: str = "Resume"
    target_role: str = "Software Engineer"
    filename: str = "CareerGPS_Resume.pdf"


# ─── Job Analysis ─────────────────────────────────────────────────────────────

class JobAnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str


class JobAnalysisResult(BaseModel):
    match_percentage: int = 0
    missing_skills: list[str] = []
    matching_skills: list[str] = []
    weak_areas: list[str] = []
    keywords_missing: list[str] = []
    technologies_missing: list[str] = []
    suggested_improvements: list[dict[str, Any]] = []
    cover_letter_tips: list[str] = []
    interview_focus_areas: list[str] = []
    summary: str = ""


# ─── Roadmap ──────────────────────────────────────────────────────────────────

class RoadmapRequest(BaseModel):
    career_path: str
    current_level: str = "beginner"
    background: str = ""
    hours_per_week: int = 10


# ─── Projects ─────────────────────────────────────────────────────────────────

class ProjectGenerateRequest(BaseModel):
    career_path: str
    skill_level: str = "intermediate"
    interests: str = ""
    count: int = 3


# ─── Interview ────────────────────────────────────────────────────────────────

class InterviewRequest(BaseModel):
    role: str
    experience_level: str = "entry"
    focus_areas: str = "general"


# ─── Skills ───────────────────────────────────────────────────────────────────

class SkillGapRequest(BaseModel):
    current_skills: list[str]
    target_role: str
    experience: str = "student / early career"


# ─── Planner ──────────────────────────────────────────────────────────────────

class PlannerRequest(BaseModel):
    goal: str
    hours_per_day: float = 2.0
    career_path: str = "Software Engineer"
    current_skills: list[str] = []
    weak_areas: list[str] = []


# ─── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    chat_history: list[ChatMessage] = []
    user_context: Optional[str] = ""
    collection_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    success: bool = True


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardUpdate(BaseModel):
    career_path: Optional[str] = None
    career_score: Optional[int] = None
    weekly_goal: Optional[str] = None
    skills: Optional[list[str]] = None
    completed_skills: Optional[list[str]] = None
    learning_hours: Optional[float] = None
    projects_built: Optional[int] = None


# ─── Bonus ────────────────────────────────────────────────────────────────────

class LinkedInReviewRequest(BaseModel):
    profile_content: str
    target_role: str = "Software Engineer"


class PortfolioReviewRequest(BaseModel):
    portfolio_content: str
    career_path: str = "Software Engineer"


class GitHubAnalysisRequest(BaseModel):
    github_info: str
    target_role: str = "Software Engineer"


class WeeklyInsightsRequest(BaseModel):
    activity_data: str
    career_path: str = "Software Engineer"
    career_score: int = 50


class WeeklyReportRequest(BaseModel):
    """Payload for weekly career report PDF (from frontend workspace)."""

    career_path: str = "Software Engineer"
    target_role: str = "Software Engineer"
    career_score: int = 0
    previous_score: int = 0
    weekly_delta: int = 0
    monthly_delta: int = 0
    roadmap_progress: int = 0
    learning_hours: float = 0
    weekly_hours: float = 0
    interview_readiness: int = 0
    resume_score: int = 0
    ats_score: int = 0
    achievements: list[str] = []
    skills_learned: list[str] = []
    recent_wins: list[str] = []
    recommended_focus: str = ""
    motivational_summary: str = ""
    breakdown: Optional[dict[str, Any]] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    career_path: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
