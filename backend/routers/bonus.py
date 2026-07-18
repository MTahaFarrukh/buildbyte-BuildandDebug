from fastapi import APIRouter

from config import get_settings
from prompts.templates import (
    GITHUB_ANALYSIS_PROMPT,
    LINKEDIN_REVIEW_PROMPT,
    PORTFOLIO_REVIEW_PROMPT,
    WEEKLY_INSIGHTS_PROMPT,
)
from schemas.models import (
    GitHubAnalysisRequest,
    LinkedInReviewRequest,
    PortfolioReviewRequest,
    WeeklyInsightsRequest,
    WeeklyReportRequest,
)
from services.ai_service import ai_service
from services.demo_data import demo_weekly_insights
from services.pdf_weekly_report import weekly_report_base64
from utils.helpers import truncate_text

router = APIRouter(prefix="/bonus", tags=["Bonus Features"])


@router.post("/linkedin")
async def review_linkedin(payload: LinkedInReviewRequest):
    prompt = LINKEDIN_REVIEW_PROMPT.format(
        profile_content=truncate_text(payload.profile_content, 6000),
        target_role=payload.target_role,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(prompt)
        else:
            result = {
                "overall_score": 68,
                "headline_score": 60,
                "about_score": 65,
                "experience_score": 70,
                "strengths": ["Clear career direction", "Relevant experience listed"],
                "improvements": [
                    {
                        "section": "Headline",
                        "issue": "Too generic",
                        "suggestion": "Include target role + key skill + value prop",
                        "rewritten_example": f"Aspiring {payload.target_role} | Building impactful products with modern tech",
                    }
                ],
                "keyword_recommendations": ["leadership", "python", "product thinking"],
                "rewritten_headline": f"Aspiring {payload.target_role} | Open to opportunities",
                "rewritten_about": "Passionate builder focused on shipping value and growing technical depth.",
                "_demo_mode": True,
            }
    except Exception:
        result = {"overall_score": 60, "summary": "Unable to fully analyze", "_demo_mode": True}
    return {"success": True, **result}


@router.post("/portfolio")
async def review_portfolio(payload: PortfolioReviewRequest):
    prompt = PORTFOLIO_REVIEW_PROMPT.format(
        portfolio_content=truncate_text(payload.portfolio_content, 6000),
        career_path=payload.career_path,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(prompt)
        else:
            result = {
                "overall_score": 64,
                "design_feedback": ["Improve visual hierarchy", "Add consistent spacing"],
                "content_feedback": ["Lead with outcomes, not just tech"],
                "project_presentation": ["Add live demos and GitHub links"],
                "missing_elements": ["About section", "Contact CTA", "Case study depth"],
                "improvements": [
                    {"priority": "high", "suggestion": "Add screenshots and architecture diagrams"},
                    {"priority": "medium", "suggestion": "Write a short case study per project"},
                ],
                "standout_tips": ["Pin your best 3 projects", "Show metrics"],
                "_demo_mode": True,
            }
    except Exception:
        result = {"overall_score": 55, "_demo_mode": True}
    return {"success": True, **result}


@router.post("/github")
async def analyze_github(payload: GitHubAnalysisRequest):
    prompt = GITHUB_ANALYSIS_PROMPT.format(
        github_info=truncate_text(payload.github_info, 6000),
        target_role=payload.target_role,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(prompt)
        else:
            result = {
                "overall_score": 58,
                "profile_strengths": ["Active repositories"],
                "weaknesses": ["Sparse READMEs", "Few pinned projects"],
                "repository_recommendations": [
                    {"action": "Add polished README to top 3 repos", "why": "Recruiters judge in 30 seconds"}
                ],
                "readme_tips": ["Screenshots", "Setup steps", "Tech stack badges"],
                "contribution_advice": ["Maintain a steady commit streak", "Contribute to docs PRs"],
                "pin_recommendations": ["Full-stack app", "Algorithm practice repo", "Open source contribution"],
                "summary": "Solid foundation — polish presentation for hiring impact.",
                "_demo_mode": True,
            }
    except Exception:
        result = {"overall_score": 50, "_demo_mode": True}
    return {"success": True, **result}


@router.post("/insights")
async def weekly_insights(payload: WeeklyInsightsRequest):
    prompt = WEEKLY_INSIGHTS_PROMPT.format(
        activity_data=payload.activity_data,
        career_path=payload.career_path,
        career_score=payload.career_score,
    )
    settings = get_settings()
    try:
        if settings.groq_api_key:
            result = await ai_service.generate_json(prompt)
        else:
            result = demo_weekly_insights(payload.career_path, payload.career_score)
    except Exception:
        result = demo_weekly_insights(payload.career_path, payload.career_score)
    return {"success": True, **result}


@router.post("/weekly-report")
async def weekly_report(payload: WeeklyReportRequest):
    """Generate a downloadable weekly career progress PDF."""
    data = payload.model_dump()
    pdf_b64 = weekly_report_base64(data)
    return {
        "success": True,
        "filename": "CareerGPS_Weekly_Report.pdf",
        "pdf_base64": pdf_b64,
        "summary": data.get("motivational_summary") or "",
        "recommended_focus": data.get("recommended_focus") or "",
    }
