/**
 * Career Operating System engines — score, recommendations, achievements.
 * Pure functions so UI and store stay in sync.
 */

export interface ScoreBreakdown {
  resumeQuality: number
  roadmap: number
  projects: number
  interview: number
  learning: number
  skillGap: number
  total: number
}

export interface ScoreSnapshot {
  current: number
  previous: number
  weeklyDelta: number
  monthlyDelta: number
  breakdown: ScoreBreakdown
}

export interface Recommendation {
  id: string
  title: string
  reason: string
  href: string
  priority: 'high' | 'medium' | 'low'
  cta: string
}

export interface AchievementDef {
  id: string
  label: string
  description: string
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_resume', label: 'First Resume', description: 'Uploaded your first resume PDF' },
  { id: 'first_analysis', label: 'Resume Analyst', description: 'Completed your first resume analysis' },
  { id: 'first_job_match', label: 'Job Matcher', description: 'Ran your first job match' },
  { id: 'week_one', label: 'Week One Done', description: 'Completed all Week 1 roadmap tasks' },
  { id: 'first_project', label: 'Project Starter', description: 'Tracked your first project' },
  { id: 'interview_ready', label: 'Interview Ready', description: 'Interview readiness reached 70+' },
  { id: 'score_80', label: 'Career 80+', description: 'Career Score reached 80 or higher' },
  { id: 'roadmap_100', label: 'Roadmap Master', description: 'Completed 100% of roadmap tasks' },
  { id: 'ats_rewrite', label: 'ATS Optimizer', description: 'Generated an ATS rewrite PDF' },
  { id: 'mentor_chat', label: 'Mentor Regular', description: 'Had 5+ mentor conversations' },
]

export interface WorkspaceScoreInput {
  resumeScore: number | null
  atsScore: number | null
  roadmapProgress: number
  projectsCompleted: number
  projectsTotal: number
  interviewReadiness: number | null
  learningHours: number
  skillGapReadiness: number | null
  weeklyGoalCompletion: number
}

/** Weighted Career Score engine (Phase 2). */
export function computeCareerScore(input: WorkspaceScoreInput): ScoreBreakdown {
  const resumeQuality = Math.min(
    100,
    Math.round(
      ((input.resumeScore ?? 0) * 0.65 + (input.atsScore ?? 0) * 0.35),
    ),
  )
  const roadmap = Math.min(100, input.roadmapProgress)
  const projects =
    input.projectsTotal > 0
      ? Math.round((input.projectsCompleted / input.projectsTotal) * 100)
      : Math.min(100, input.projectsCompleted * 25)
  const interview = Math.min(100, input.interviewReadiness ?? 0)
  // Learning: 1h ≈ 2 pts up to 100; blend weekly goal
  const learningRaw = Math.min(100, input.learningHours * 2)
  const learning = Math.round(learningRaw * 0.7 + input.weeklyGoalCompletion * 0.3)
  // Skill gap readiness (higher = better) or inverse of missing intensity
  const skillGap = Math.min(100, input.skillGapReadiness ?? Math.max(20, 100 - roadmap * 0.3))

  const total = Math.min(
    100,
    Math.round(
      resumeQuality * 0.25 +
        roadmap * 0.2 +
        projects * 0.2 +
        interview * 0.15 +
        learning * 0.1 +
        skillGap * 0.1,
    ),
  )

  return { resumeQuality, roadmap, projects, interview, learning, skillGap, total }
}

export function getRecommendations(ctx: {
  hasResume: boolean
  hasAnalysis: boolean
  resumeScore: number | null
  hasRoadmap: boolean
  roadmapProgress: number
  nextTaskTitle: string | null
  hasJobMatch: boolean
  interviewReadiness: number | null
  projectsCompleted: number
  missingSkills: string[]
  careerScore: number
}): Recommendation[] {
  const out: Recommendation[] = []

  if (!ctx.hasResume) {
    out.push({
      id: 'upload_resume',
      title: 'Upload your resume',
      reason: 'Start your career OS with a PDF resume.',
      href: '/app/resume',
      priority: 'high',
      cta: 'Upload Resume',
    })
  } else if (!ctx.hasAnalysis) {
    out.push({
      id: 'analyze_resume',
      title: 'Analyze your resume',
      reason: 'Get ATS and quality scores to unlock Career Score.',
      href: '/app/resume',
      priority: 'high',
      cta: 'Analyze Now',
    })
  } else if ((ctx.resumeScore ?? 0) < 65) {
    out.push({
      id: 'improve_resume',
      title: 'Improve your resume',
      reason: `Resume score is ${ctx.resumeScore}. Run ATS Rewrite + PDF.`,
      href: '/app/resume',
      priority: 'high',
      cta: 'Improve Resume',
    })
  }

  if (!ctx.hasRoadmap) {
    out.push({
      id: 'create_roadmap',
      title: 'Create your roadmap',
      reason: 'Turn your goal into weekly topics you can check off.',
      href: '/app/roadmap',
      priority: 'high',
      cta: 'Create Roadmap',
    })
  } else if (ctx.roadmapProgress < 100 && ctx.nextTaskTitle) {
    out.push({
      id: 'continue_roadmap',
      title: `Continue: ${ctx.nextTaskTitle}`,
      reason: `Roadmap is ${ctx.roadmapProgress}% complete.`,
      href: '/app/roadmap',
      priority: 'high',
      cta: 'Continue Learning',
    })
  }

  if (ctx.missingSkills.length > 0) {
    out.push({
      id: 'skill_gap',
      title: `Learn ${ctx.missingSkills[0]}`,
      reason: 'Skill gap analysis highlights this as a priority.',
      href: '/app/skills',
      priority: 'medium',
      cta: 'View Skill Gap',
    })
  }

  if ((ctx.interviewReadiness ?? 0) < 70) {
    out.push({
      id: 'practice_interview',
      title: 'Practice interviews',
      reason: 'Interview readiness needs work for your target role.',
      href: '/app/job-prep',
      priority: 'medium',
      cta: 'Open Job Prep',
    })
  }

  if (!ctx.hasJobMatch && ctx.hasResume) {
    out.push({
      id: 'job_match',
      title: 'Match against a job description',
      reason: 'See how you compare to a real role.',
      href: '/app/job-prep',
      priority: 'medium',
      cta: 'Job Prep Copilot',
    })
  }

  if (ctx.projectsCompleted < 1) {
    out.push({
      id: 'first_project',
      title: 'Start a portfolio project',
      reason: 'Projects heavily influence Career Score.',
      href: '/app/projects',
      priority: 'medium',
      cta: 'Generate Projects',
    })
  }

  if (ctx.careerScore >= 70) {
    out.push({
      id: 'apply',
      title: 'You are getting close — polish & apply',
      reason: `Career Score is ${ctx.careerScore}. Keep improving ATS and interviews.`,
      href: '/app/job-prep',
      priority: 'low',
      cta: 'Prep Applications',
    })
  }

  // Deduplicate by id, sort by priority
  const order = { high: 0, medium: 1, low: 2 }
  const seen = new Set<string>()
  return out
    .filter((r) => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })
    .sort((a, b) => order[a.priority] - order[b.priority])
    .slice(0, 4)
}

export function evaluateAchievements(flags: {
  hasResume: boolean
  hasAnalysis: boolean
  hasJobMatch: boolean
  weekOneComplete: boolean
  hasProject: boolean
  interviewReady: boolean
  score80: boolean
  roadmap100: boolean
  hasRewrite: boolean
  mentorMessages: number
}): string[] {
  const unlocked: string[] = []
  if (flags.hasResume) unlocked.push('first_resume')
  if (flags.hasAnalysis) unlocked.push('first_analysis')
  if (flags.hasJobMatch) unlocked.push('first_job_match')
  if (flags.weekOneComplete) unlocked.push('week_one')
  if (flags.hasProject) unlocked.push('first_project')
  if (flags.interviewReady) unlocked.push('interview_ready')
  if (flags.score80) unlocked.push('score_80')
  if (flags.roadmap100) unlocked.push('roadmap_100')
  if (flags.hasRewrite) unlocked.push('ats_rewrite')
  if (flags.mentorMessages >= 5) unlocked.push('mentor_chat')
  return unlocked
}
