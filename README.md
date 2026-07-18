# CareerGPS AI

**Your AI-powered Career Operating System for Students & Young Professionals.**

> Built for **BuildByte** — IEEE NED Student Branch Hackathon

### Project
[![BuildByte](https://img.shields.io/badge/Hackathon-BuildByte-4F46E5?style=for-the-badge&logo=ieee&logoColor=white)](https://github.com/MTahaFarrukh/buildbyte-BuildandDebug)
[![Team](https://img.shields.io/badge/Team-BuildandDebug-7C3AED?style=for-the-badge)](#team)
[![Product](https://img.shields.io/badge/Product-CareerGPS%20AI-06B6D4?style=for-the-badge)](#solution-overview-in-our-own-words)
[![Status](https://img.shields.io/badge/Status-Career%20OS%20Ready-10B981?style=for-the-badge)](#submission-checklist)

### Repository
[![GitHub](https://img.shields.io/badge/GitHub-buildbyte--BuildandDebug-181717?style=flat-square&logo=github)](https://github.com/MTahaFarrukh/buildbyte-BuildandDebug)
[![License](https://img.shields.io/badge/License-Hackathon%20Use-blue?style=flat-square)](#license)
[![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](https://github.com/MTahaFarrukh/buildbyte-BuildandDebug)

### Frontend
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-Workspace-443E38?style=flat-square)](https://zustand-demo.pmnd.rs)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Motion-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion)

### Backend & AI
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-Orchestration-1C3C3C?style=flat-square)](https://www.langchain.com)
[![Groq](https://img.shields.io/badge/Groq-Inference-F55036?style=flat-square)](https://groq.com)
[![Llama](https://img.shields.io/badge/Llama-3.3%2070B-0467DF?style=flat-square&logo=meta&logoColor=white)](https://ai.meta.com/llama)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-RAG-FF6F00?style=flat-square)](https://www.trychroma.com)
[![ReportLab](https://img.shields.io/badge/ReportLab-PDF-FF6F00?style=flat-square)](https://www.reportlab.com)

### Platform
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB%20%2B%20Storage-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)

---

## Team

| Field | Details |
|-------|---------|
| **Team name** | **BuildandDebug** |
| **Members** | Muhammad Taha Farrukh · Muhammad Bilal Rasheed |
| **Repository** | https://github.com/MTahaFarrukh/buildbyte-BuildandDebug |
| **Product** | CareerGPS AI |

---

## Solution Overview (in our own words)

Students graduate every year with degrees but without a clear hiring path. They don’t know which skills companies actually want, whether their resume will pass ATS filters, what projects to build, or how to prepare for interviews. Generic chatbots give advice that disappears the moment the tab closes — no roadmap, no scores, no downloadable resume, no progress.

**CareerGPS AI** is our answer: a **Career Operating System** — not a pile of disconnected AI tools. One shared workspace powers resume analysis, job prep, roadmaps, projects, interviews, mentor chat, analytics, achievements, and a live Career Score. Changing data in one module immediately updates every other module.

We designed it like a real SaaS product (Notion AI × Duolingo × LinkedIn Learning energy): dark/light theme, glass UI, gamified roadmap progress, achievement confetti, weekly PDF reports, and a modular FastAPI backend with structured JSON prompts so every AI feature returns usable data.

---

## Why this is innovative

Most “career AI” demos stop at one chat box. CareerGPS combines **diagnose → plan → practice → package → progress** in one loop:

1. **Diagnose** — resume scores, skill gaps, JD match %
2. **Plan** — personalized roadmaps + learning planner
3. **Practice** — interview suites + RAG mentor with full career memory
4. **Package** — ATS rewrite & AI-built resumes as real PDFs
5. **Progress** — Career Score engine, achievements, timeline, weekly report PDF

The differentiator is not “we called an LLM.” It is a **unified career workspace** where scores, tasks, PDFs, and mentor memory stay connected.

---

## Features

| Feature | Description |
|---------|-------------|
| **Landing** | Premium marketing page — hero, features, testimonials, FAQ |
| **Auth** | Signup, login, forgot password, Google OAuth (Supabase) |
| **Dashboard** | Command center: Career Score breakdown, today’s tasks, achievements, weekly report export |
| **Career Score Engine** | Weighted live score (Resume 25% · Roadmap 20% · Projects 20% · Interview 15% · Learning 10% · Skill Gap 10%) |
| **Smart Recommendations** | Next-best-action banners on every major page |
| **Resume AI** | PDF upload, multi-score analysis, ATS rewrite, **downloadable PDF** |
| **Build Resume** | No resume? AI builds one from your details → **PDF export** |
| **Job Prep Copilot** | PDF + JD → match, skill gap, interview prep, RAG chat, interview history |
| **Roadmap** | Monthly topics → weekly plan + ☐ / ◐ / ☑ gamified tasks |
| **Achievements** | Badges + confetti (first resume, week one, score 80+, etc.) |
| **Projects** | AI project ideas → trackable status, GitHub link, completion → score |
| **Skill Gap** | Priority-ordered missing skills synced to workspace |
| **Learning Planner** | Daily / weekly / monthly adaptive plans |
| **AI Mentor** | Proactive coach with RAG + full Career OS memory |
| **Timeline** | Contribution-style heatmap of career journey events |
| **PDF Library** | View / rename / delete / reuse uploaded PDFs across modules |
| **Analytics** | Charts from real workspace progress |
| **Weekly Report** | AI summary + downloadable PDF |
| **Pro Tools** | LinkedIn, portfolio, and GitHub profile reviews |
| **Settings** | Theme, notifications, profile, account controls |

### Guided user flow

```
Landing → Signup → Upload Resume → Analysis → Career Score
       → Generate Roadmap → Complete Tasks → Projects
       → Mock Interview → Improve Resume → Apply for Jobs
```

---

## Tech Stack

### Frontend
React · Vite · TypeScript · Tailwind CSS v4 · Zustand (persisted Career Workspace) · Framer Motion · React Router · Lucide · Axios · Recharts · Sonner · Supabase JS

### Backend
FastAPI · Uvicorn · LangChain · Groq (Llama 3.3 70B) · ChromaDB + sentence-transformers (RAG) · Pydantic · pypdf · ReportLab (resume + weekly report PDFs) · Supabase (Auth, DB, Storage)

---

## Architecture

```
┌─────────────┐     REST/JSON      ┌──────────────┐
│  React App  │ ◄────────────────► │   FastAPI    │
│  + Zustand  │                    │   (Render)   │
│ Career OS   │                    └──────┬───────┘
└──────┬──────┘                           │
       │ Supabase Auth         ┌──────────┼──────────┐
       ▼                       ▼          ▼          ▼
┌─────────────┐          ┌─────────┐ ┌────────┐ ┌──────────┐
│  Supabase   │          │ Groq    │ │ChromaDB│ │ReportLab │
│ Auth/DB/S3  │          │ Llama   │ │  RAG   │ │   PDFs   │
└─────────────┘          └─────────┘ └────────┘ └──────────┘
```

- One **Career Workspace** (`frontend/src/store/workspace.ts`) shared by all pages
- Modular backend: `routers` → `services` → `prompts` / `database`
- Structured JSON AI outputs + demo fallbacks when keys are missing

---

## Folder Structure

```
buildbyte-hackathon/
├── frontend/
│   ├── src/
│   │   ├── components/       # UI, layout, RecommendationBanner, PDF uploader
│   │   ├── context/          # Auth + Theme
│   │   ├── lib/              # API, careerEngine, celebrate, utils
│   │   ├── pages/            # Product screens (+ Timeline, Library, Job Prep)
│   │   ├── store/            # Zustand Career Workspace
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── routers/
│   ├── services/             # AI, RAG, PDF resume/weekly report, roadmap derive
│   ├── schemas/
│   ├── prompts/
│   ├── database/             # Supabase client + schema.sql
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── docs/screenshots/
└── README.md
```

---

## Quick Start (Installation)

### Prerequisites
- Node.js 20+
- Python 3.11+
- Groq API key (for live AI)
- Supabase project (for real auth/storage; demo auth works without it)

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # Windows: copy .env.example .env
# Add GROQ_API_KEY and Supabase keys to .env

uvicorn main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Windows: copy .env.example .env
# Set VITE_API_URL=http://localhost:8000
npm run dev
```

App: http://localhost:5173

---

## Environment Variables

> Never commit real secrets. Use `.env.example` as the template.

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key for Llama 3.3 70B |
| `GROQ_MODEL` | Default: `llama-3.3-70b-versatile` |
| `SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) — **no** `/rest/v1/` |
| `SUPABASE_KEY` | Anon / public key |
| `SUPABASE_SERVICE_KEY` | Service role key (storage/admin) |
| `FRONTEND_URL` | CORS origin (`http://localhost:5173`) |
| `PORT` | API port (`8000`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (`http://localhost:8000`) |
| `VITE_SUPABASE_URL` | Same Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

### Setup tips
1. Groq key → https://console.groq.com  
2. Supabase → create project → Settings → API  
3. Run `backend/database/schema.sql` in SQL Editor  
4. Storage bucket: `resumes`  
5. Auth → Email → disable **Confirm email** for local demo  
6. Optional: enable Google provider  
7. First RAG request may download the embedding model (`all-MiniLM-L6-v2`) — wait once  

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Password reset |
| POST | `/api/resume/upload` | Upload PDF |
| POST | `/api/resume/analyze` | AI resume analysis |
| POST | `/api/resume/rewrite` | ATS rewrite + PDF (`pdf_base64`) |
| POST | `/api/resume/build` | Build resume from profile + PDF |
| POST | `/api/resume/pdf` | Generate PDF from structured/plain text |
| POST | `/api/job/analyze` | Resume vs JD |
| POST | `/api/job/analyze-pdf` | PDF resume + JD → match, gap, interview, RAG |
| POST | `/api/roadmap/generate` | Career roadmap (monthly → weekly derived) |
| POST | `/api/project/generate` | Project ideas |
| POST | `/api/interview/generate` | Interview prep |
| POST | `/api/skills/analyze` | Skill gap |
| POST | `/api/planner` | Learning plan |
| POST | `/api/chat` | Career mentor (RAG-aware) |
| POST | `/api/chat/upload-pdf` | Embed PDF into Chroma for mentor |
| GET | `/api/dashboard/{user_id}` | Dashboard data |
| POST | `/api/bonus/linkedin` | LinkedIn review |
| POST | `/api/bonus/portfolio` | Portfolio review |
| POST | `/api/bonus/github` | GitHub analysis |
| POST | `/api/bonus/insights` | Weekly AI insights |
| POST | `/api/bonus/weekly-report` | Weekly progress report PDF |

---

## Demo Script (judges)

1. Sign up / demo login → open **Dashboard** (empty-state CTAs)
2. **Resume AI** → upload PDF → Analyze → ATS Rewrite + download PDF
3. Watch **Career Score** rise in the top bar
4. **Job Prep Copilot** → same resume + paste JD → match % + interview history
5. **Roadmap** → generate → mark tasks ☐ → ◐ → ☑ (achievements / confetti)
6. **Projects** → generate → set status / GitHub link
7. **AI Mentor** → ask “What should I study next?” (uses live memory)
8. **Timeline** + **PDF Library** → journey + reusable docs
9. Dashboard → **Weekly Report** PDF download

---

## Deployment

### Frontend → Vercel
1. Import `frontend`  
2. Env: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`  
3. Build: `npm run build` · Output: `dist`

### Backend → Render
1. Web service from `backend`  
2. Build: `pip install -r requirements.txt`  
3. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`  
4. Set production env vars; update `FRONTEND_URL` / `VITE_API_URL`

---

## Submission Checklist

- [x] Team name & members in README  
- [x] Public GitHub repository  
- [x] Clear problem → solution narrative  
- [x] Install & run instructions  
- [x] Environment variable documentation  
- [x] Feature table + demo script  
- [x] No secrets committed (`.env` gitignored)  

---

## Screenshots

Add PNGs under `docs/screenshots/`:

| File | Screen |
|------|--------|
| `hero.png` | Landing hero |
| `dashboard.png` | Career command center |
| `resume.png` | Resume AI + PDF download |
| `roadmap.png` | Gamified roadmap |
| `chat.png` | AI Mentor |
| `timeline.png` | Career timeline |

---

## Color Palette

| Token | Hex |
|-------|-----|
| Primary | `#4F46E5` |
| Secondary | `#7C3AED` |
| Accent | `#06B6D4` |
| Light BG | `#F8FAFC` |
| Dark BG | `#07070C` |

Typography: **Inter**

---

## License

Built for BuildByte (IEEE NED Student Branch) by **BuildandDebug**.  
For hackathon evaluation and learning use.
