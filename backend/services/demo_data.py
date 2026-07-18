"""Demo/fallback responses when Groq API is unavailable — still structured & useful."""

from typing import Any


def demo_resume_analysis(resume_text: str, target_role: str) -> dict[str, Any]:
    skills_found = []
    skill_keywords = [
        "python", "javascript", "typescript", "react", "node", "sql", "java",
        "aws", "docker", "kubernetes", "machine learning", "fastapi", "django",
        "git", "html", "css", "mongodb", "postgresql", "tensorflow", "pytorch",
    ]
    lower = resume_text.lower()
    for sk in skill_keywords:
        if sk in lower:
            skills_found.append(sk.title())

    base = 55 + min(len(skills_found) * 3, 30)
    return {
        "overall_score": min(base, 92),
        "ats_score": min(base - 5, 88),
        "formatting_score": 72,
        "grammar_score": 78,
        "projects_score": min(base - 8, 85),
        "experience_score": min(base - 10, 80),
        "education_score": 80,
        "skills_score": min(50 + len(skills_found) * 5, 90),
        "career_confidence_score": min(base - 3, 85),
        "summary": (
            f"Your resume shows solid potential for {target_role}. "
            f"We detected {len(skills_found)} relevant technical skills. "
            "Strengthen quantified achievements and ATS keywords to stand out."
        ),
        "strengths": [
            "Clear educational background",
            f"Relevant skills for {target_role}" if skills_found else "Willingness to learn",
            "Structured sections present",
        ],
        "weaknesses": [
            "Limited quantified impact metrics",
            "Could improve ATS keyword density",
            "Project descriptions need more depth",
        ],
        "suggestions": [
            {
                "category": "Impact",
                "priority": "high",
                "suggestion": "Add metrics to bullets (e.g., 'improved load time by 40%').",
            },
            {
                "category": "ATS",
                "priority": "high",
                "suggestion": f"Mirror keywords from {target_role} job postings.",
            },
            {
                "category": "Projects",
                "priority": "medium",
                "suggestion": "Add tech stack and outcomes for each project.",
            },
        ],
        "extracted_skills": skills_found or ["Communication", "Problem Solving"],
        "rewritten_summary": (
            f"Motivated aspiring {target_role} with hands-on experience in "
            f"{', '.join(skills_found[:4]) or 'software development'}. "
            "Eager to contribute to impactful products while growing technical depth."
        ),
        "ats_optimized_bullets": [
            f"Built projects using {', '.join(skills_found[:3]) or 'modern web technologies'}",
            "Collaborated on team projects demonstrating ownership and delivery",
            "Continuously learning industry best practices and tools",
        ],
        "_demo_mode": True,
    }


def demo_job_analysis(job_description: str) -> dict[str, Any]:
    return {
        "match_percentage": 62,
        "missing_skills": ["System Design", "CI/CD", "Unit Testing"],
        "matching_skills": ["Problem Solving", "Communication"],
        "weak_areas": ["Production experience", "Scalability concepts"],
        "keywords_missing": ["agile", "microservices", "REST APIs"],
        "technologies_missing": ["Docker", "Kubernetes", "Redis"],
        "suggested_improvements": [
            {
                "area": "Skills",
                "action": "Add a dedicated skills section matching JD keywords",
                "impact": "high",
            },
            {
                "area": "Projects",
                "action": "Highlight projects that mirror job responsibilities",
                "impact": "high",
            },
        ],
        "cover_letter_tips": [
            "Open with why this company's mission resonates with you",
            "Map 2-3 resume achievements to JD requirements",
        ],
        "interview_focus_areas": ["Core fundamentals", "Past project deep-dives"],
        "summary": (
            "Moderate match. Closing the skill gaps listed above and aligning "
            "resume language with the JD will significantly improve your odds."
        ),
        "_demo_mode": True,
    }


def demo_roadmap(career_path: str, current_level: str) -> dict[str, Any]:
    return {
        "career_path": career_path,
        "duration_months": 6,
        "overview": f"A structured 6-month path from {current_level} to job-ready {career_path}.",
        "skill_levels": {
            "beginner": ["Fundamentals", "Tools & Environment", "Version Control"],
            "intermediate": ["Core Frameworks", "APIs", "Databases"],
            "advanced": ["System Design", "Testing", "Deployment"],
        },
        "weekly_timeline": [
            {"week": i, "focus": f"Week {i} focus area", "tasks": [f"Study topic {i}", f"Practice exercise {i}"], "hours": 10}
            for i in range(1, 5)
        ],
        "monthly_timeline": [
            {"month": 1, "theme": "Foundations", "milestones": ["Complete fundamentals"], "skills_to_master": ["Basics"]},
            {"month": 2, "theme": "Building", "milestones": ["Ship first project"], "skills_to_master": ["Framework"]},
            {"month": 3, "theme": "Depth", "milestones": ["Intermediate project"], "skills_to_master": ["APIs", "DB"]},
            {"month": 4, "theme": "Polish", "milestones": ["Portfolio ready"], "skills_to_master": ["Testing"]},
            {"month": 5, "theme": "Interview Prep", "milestones": ["Mock interviews"], "skills_to_master": ["DSA"]},
            {"month": 6, "theme": "Job Hunt", "milestones": ["Apply to roles"], "skills_to_master": ["System Design"]},
        ],
        "projects": [
            {
                "title": f"{career_path} Starter Project",
                "difficulty": "beginner",
                "description": "A foundational portfolio piece",
                "tech_stack": ["Relevant core stack"],
            },
            {
                "title": f"Intermediate {career_path} App",
                "difficulty": "intermediate",
                "description": "Full-featured application with real-world patterns",
                "tech_stack": ["Framework", "Database", "Auth"],
            },
        ],
        "courses": [
            {"title": f"{career_path} Bootcamp Path", "provider": "freeCodeCamp / Coursera", "url_hint": career_path, "free": True}
        ],
        "books": [
            {"title": "Clean Code", "author": "Robert C. Martin", "why": "Write professional-quality code"}
        ],
        "certifications": [
            {"name": f"Relevant {career_path} Certificate", "provider": "Industry body", "priority": "medium"}
        ],
        "practice_resources": [
            {"name": "LeetCode / HackerRank", "type": "platform", "description": "Coding practice"},
            {"name": "GitHub", "type": "repo", "description": "Open source contributions"},
        ],
        "_demo_mode": True,
    }


def demo_projects(career_path: str, skill_level: str, count: int) -> dict[str, Any]:
    templates = [
        ("Personal Task Manager", "Build a productivity app with auth and CRUD"),
        ("Analytics Dashboard", "Visualize data with charts and filters"),
        ("AI Chat Assistant", "Create a conversational interface with an LLM API"),
        ("E-commerce Mini Store", "Products, cart, and checkout flow"),
        ("Real-time Collaboration Board", "Multi-user whiteboard with websockets"),
    ]
    projects = []
    for i in range(min(count, len(templates))):
        title, problem = templates[i]
        projects.append({
            "title": f"{title} ({career_path})",
            "problem_statement": problem,
            "features": ["User authentication", "Core CRUD", "Responsive UI", "Deployed demo"],
            "tech_stack": ["React", "FastAPI", "PostgreSQL", "Tailwind"],
            "architecture": "Client-server with REST API, JWT auth, and hosted database",
            "timeline_weeks": 2 if skill_level == "beginner" else 3 if skill_level == "intermediate" else 4,
            "difficulty": skill_level,
            "learning_outcomes": ["Full-stack delivery", "Clean architecture", "Deployment"],
            "github_tips": [
                "Write a detailed README with screenshots",
                "Use conventional commits",
                "Add a live demo link",
            ],
            "milestones": ["Setup & auth", "Core features", "Polish & deploy"],
            "stretch_goals": ["Dark mode", "Analytics", "CI/CD pipeline"],
        })
    return {"projects": projects, "_demo_mode": True}


def demo_interview(role: str) -> dict[str, Any]:
    return {
        "role": role,
        "technical_questions": [
            {
                "question": f"Explain a core concept relevant to {role}.",
                "difficulty": "medium",
                "hints": ["Start with definition", "Give a real example"],
                "sample_answer_outline": "Define → Example → Trade-offs → Conclusion",
            },
            {
                "question": "Walk me through how you would debug a production issue.",
                "difficulty": "medium",
                "hints": ["Reproduce", "Isolate", "Fix", "Prevent"],
                "sample_answer_outline": "Observability → Root cause → Fix → Postmortem",
            },
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you faced a difficult technical challenge.",
                "star_framework_tips": "Situation → Task → Action → Result with metrics",
                "sample_points": ["Context", "Your ownership", "Outcome"],
            }
        ],
        "hr_questions": [
            {
                "question": "Why do you want this role?",
                "what_they_look_for": "Genuine interest + alignment with company",
                "tips": "Connect your story to their product/mission",
            }
        ],
        "coding_questions": [
            {
                "title": "Two Sum",
                "difficulty": "easy",
                "problem": "Find two numbers that add up to target",
                "approach": "Hash map for O(n)",
                "complexity": "O(n) time, O(n) space",
            }
        ],
        "system_design_questions": [
            {
                "question": "Design a URL shortener",
                "key_components": ["API", "Hashing", "Database", "Caching"],
                "discussion_points": ["Collision handling", "Analytics", "Scale"],
            }
        ],
        "mock_interview": {
            "opening": f"Welcome! Today we'll simulate a {role} interview.",
            "questions_sequence": [
                "Tell me about yourself",
                "Technical deep-dive question",
                "Coding problem",
                "Behavioral STAR question",
                "Your questions for us",
            ],
            "evaluation_criteria": ["Clarity", "Depth", "Communication", "Problem-solving"],
            "closing_advice": "Always prepare 2-3 thoughtful questions about the team and product.",
        },
        "_demo_mode": True,
    }


def demo_skill_gap(target_role: str, current_skills: list[str]) -> dict[str, Any]:
    missing = [
        {
            "skill": "System Design",
            "priority": 1,
            "difficulty": "hard",
            "estimated_hours": 40,
            "estimated_weeks": 4,
            "why_important": "Critical for mid-level interviews",
            "resources": ["System Design Primer", "ByteByteGo"],
        },
        {
            "skill": "Testing & CI/CD",
            "priority": 2,
            "difficulty": "medium",
            "estimated_hours": 20,
            "estimated_weeks": 2,
            "why_important": "Shows production readiness",
            "resources": ["pytest docs", "GitHub Actions tutorials"],
        },
        {
            "skill": "Cloud Basics (AWS/GCP)",
            "priority": 3,
            "difficulty": "medium",
            "estimated_hours": 25,
            "estimated_weeks": 3,
            "why_important": "Most teams deploy to cloud",
            "resources": ["AWS Free Tier labs"],
        },
    ]
    return {
        "target_role": target_role,
        "current_skills": [
            {"skill": s, "level": "intermediate", "relevance": "high"} for s in current_skills
        ] or [{"skill": "General Programming", "level": "beginner", "relevance": "high"}],
        "missing_skills": missing,
        "skills_to_improve": [
            {"skill": current_skills[0] if current_skills else "Fundamentals", "current_level": "beginner", "target_level": "advanced", "actions": ["Build 2 projects", "Teach someone else"]}
        ],
        "overall_readiness": 48,
        "estimated_time_to_ready_weeks": 12,
        "priority_learning_order": [m["skill"] for m in missing],
        "summary": f"You're on the path to {target_role}. Focus on the top-priority gaps first.",
        "_demo_mode": True,
    }


def demo_planner(goal: str, career_path: str) -> dict[str, Any]:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return {
        "goal": goal,
        "daily_tasks": [
            {
                "day": day,
                "tasks": [
                    {"title": "Focused study block", "duration_minutes": 60, "type": "study"},
                    {"title": "Hands-on practice", "duration_minutes": 45, "type": "practice"},
                ],
                "total_minutes": 105,
            }
            for day in days[:5]
        ]
        + [
            {
                "day": "Saturday",
                "tasks": [{"title": "Project build session", "duration_minutes": 120, "type": "project"}],
                "total_minutes": 120,
            },
            {
                "day": "Sunday",
                "tasks": [{"title": "Weekly review & plan", "duration_minutes": 45, "type": "review"}],
                "total_minutes": 45,
            },
        ],
        "weekly_tasks": [
            {"week": 1, "theme": "Foundations", "tasks": ["Setup environment", "Complete module 1"], "milestone": "Basics locked in"},
            {"week": 2, "theme": "Build", "tasks": ["Start project", "Daily practice"], "milestone": "MVP started"},
        ],
        "monthly_goals": [
            {"month": 1, "goals": [goal, f"Advance in {career_path}"], "success_metrics": ["Complete 80% of daily tasks", "Ship 1 project"]}
        ],
        "adaptation_notes": "If you miss 2+ days, reduce daily load by 20% and protect one deep-work block.",
        "motivation_tips": ["Track streaks", "Celebrate small wins", "Study with a peer"],
        "accountability_checkpoints": ["Sunday review", "Friday demo to a friend"],
        "_demo_mode": True,
    }


def demo_chat_reply(message: str) -> str:
    snippet = message[:120] + ("..." if len(message) > 120 else "")
    return (
        f'I hear you - "{snippet}". '
        "As your CareerGPS mentor, here's a practical next step: pick one concrete action "
        "you can finish in the next 48 hours (a resume bullet rewrite, one LeetCode medium, "
        "or a project README). Small consistent wins compound into job-ready confidence. "
        "What would you like to tackle first - resume, skills, projects, or interviews?\n\n"
        "_(Demo mode: add GROQ_API_KEY for full AI mentor responses.)_"
    )


def demo_weekly_insights(career_path: str, career_score: int) -> dict[str, Any]:
    return {
        "week_summary": f"Solid progress toward {career_path}. Consistency is building.",
        "wins": ["Maintained learning streak", "Improved resume score", "Completed practice tasks"],
        "areas_to_focus": ["Deep project work", "Interview practice"],
        "recommended_actions": [
            {"action": "Complete one portfolio project milestone", "why": "Tangible proof of skill", "estimated_time": "3 hours"},
            {"action": "Do a 30-min mock interview", "why": "Reduce interview anxiety", "estimated_time": "30 minutes"},
        ],
        "motivation_message": "You're closer than you think. One focused week can change your trajectory.",
        "career_confidence_delta": 3,
        "next_week_focus": "Ship something visible on GitHub",
        "_demo_mode": True,
    }
