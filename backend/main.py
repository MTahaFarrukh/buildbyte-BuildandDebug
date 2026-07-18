from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import auth, bonus, chat, dashboard, interview, job, planner, project, resume, roadmap, skills

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI Career Mentor API for students & young professionals",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(job.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(project.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(planner.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(bonus.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "groq_configured": bool(settings.groq_api_key),
        "supabase_configured": bool(settings.supabase_url and settings.supabase_key),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
