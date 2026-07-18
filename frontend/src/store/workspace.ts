import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ACHIEVEMENT_DEFS,
  computeCareerScore,
  evaluateAchievements,
  getRecommendations,
  type Recommendation,
  type ScoreSnapshot,
} from '@/lib/careerEngine'
import { celebrateAchievement } from '@/lib/celebrate'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export type ProjectStatus = 'planning' | 'started' | 'in_progress' | 'completed'

export interface RoadmapTask {
  id: string
  month: number
  week: number
  title: string
  status: TaskStatus
  hours?: number
}

export interface UploadedDoc {
  id: string
  filename: string
  text: string
  source: 'resume' | 'job' | 'mentor' | 'other'
  uploadedAt: string
  collection_id?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  at?: string
}

export interface TimelineEvent {
  id: string
  type: string
  title: string
  detail?: string
  at: string
}

export interface TrackedProject {
  id: string
  title: string
  difficulty: string
  status: ProjectStatus
  githubUrl: string
  completionDate: string | null
  techStack: string[]
  createdAt: string
}

export interface MockInterviewRecord {
  id: string
  date: string
  role: string
  difficulty: string
  score: number
  weakAreas: string[]
  strongAreas: string[]
  suggestions: string[]
}

export interface ScoreHistoryEntry {
  at: string
  score: number
  breakdown?: Record<string, number>
}

interface WorkspaceState {
  // Resume
  resumeId: string | null
  resumeFilename: string | null
  resumeText: string
  resumeAnalysis: Record<string, unknown> | null
  resumeRewrite: Record<string, unknown> | null
  resumeScore: number | null
  atsScore: number | null

  // Job prep
  jobDescription: string
  jobMatch: Record<string, unknown> | null
  interviewPrep: Record<string, unknown> | null
  skillGap: Record<string, unknown> | null
  interviewReadiness: number | null

  // Roadmap & tasks
  careerPath: string
  roadmap: Record<string, unknown> | null
  roadmapTasks: RoadmapTask[]

  // Planner / projects
  learningPlan: Record<string, unknown> | null
  projectsBuilt: number
  learningHours: number
  trackedProjects: TrackedProject[]

  // Docs & chat
  documents: UploadedDoc[]
  mentorChat: ChatMessage[]
  jobPrepChat: ChatMessage[]
  ragCollectionId: string | null

  // Meta / OS
  targetRole: string
  weeklyGoal: string
  timeline: TimelineEvent[]
  achievements: string[]
  scoreHistory: ScoreHistoryEntry[]
  mockInterviews: MockInterviewRecord[]
  weeklyGoalTargetHours: number
  weeklyHoursLogged: number

  // Actions
  setResumeUpload: (payload: { resumeId: string; filename: string; text: string }) => void
  setResumeAnalysis: (analysis: Record<string, unknown>) => void
  setResumeRewrite: (rewrite: Record<string, unknown>) => void
  setJobDescription: (jd: string) => void
  setJobMatch: (match: Record<string, unknown>) => void
  setInterviewPrep: (data: Record<string, unknown>) => void
  setSkillGap: (data: Record<string, unknown>) => void
  setInterviewReadiness: (score: number) => void
  setRoadmap: (roadmap: Record<string, unknown>, tasks: RoadmapTask[]) => void
  setTaskStatus: (taskId: string, status: TaskStatus) => void
  setLearningPlan: (plan: Record<string, unknown>) => void
  addDocument: (doc: UploadedDoc) => void
  removeDocument: (id: string) => void
  renameDocument: (id: string, filename: string) => void
  setMentorChat: (msgs: ChatMessage[]) => void
  appendMentorChat: (msg: ChatMessage) => void
  setJobPrepChat: (msgs: ChatMessage[]) => void
  appendJobPrepChat: (msg: ChatMessage) => void
  setRagCollectionId: (id: string | null) => void
  setCareerPath: (path: string) => void
  setTargetRole: (role: string) => void
  setWeeklyGoal: (goal: string) => void
  addLearningHours: (hours: number) => void
  incrementProjects: () => void
  upsertTrackedProjects: (projects: Omit<TrackedProject, 'id' | 'createdAt' | 'status' | 'githubUrl' | 'completionDate'>[]) => void
  updateTrackedProject: (id: string, patch: Partial<TrackedProject>) => void
  addMockInterview: (record: Omit<MockInterviewRecord, 'id'>) => void
  addTimelineEvent: (type: string, title: string, detail?: string) => void
  syncAchievements: () => void
  recordScoreSnapshot: () => void
  resetWorkspace: () => void

  // Derived
  getCareerScore: () => number
  getScoreSnapshot: () => ScoreSnapshot
  getRoadmapProgress: () => number
  getCompletedTaskCount: () => number
  getNextTask: () => RoadmapTask | null
  getRecommendations: () => Recommendation[]
  getWeeklyReportData: () => Record<string, unknown>
  getAnalytics: () => {
    careerProgress: { week: string; score: number }[]
    skillsCompletedMonthly: { month: string; count: number }[]
    learningHoursMonthly: { month: string; hours: number }[]
    projectsTimeline: { month: string; count: number }[]
    resumeScores: { date: string; score: number }[]
    weeklyCompletion: number
    monthlyCompletion: number
    interviewReadiness: number
    resumeImprovement: number
    roadmapProgress: number
    completedSkills: number
    completedProjects: number
    hoursStudied: number
    aiUsage: number
  }
}

const initial = {
  resumeId: null as string | null,
  resumeFilename: null as string | null,
  resumeText: '',
  resumeAnalysis: null as Record<string, unknown> | null,
  resumeRewrite: null as Record<string, unknown> | null,
  resumeScore: null as number | null,
  atsScore: null as number | null,
  jobDescription: '',
  jobMatch: null as Record<string, unknown> | null,
  interviewPrep: null as Record<string, unknown> | null,
  skillGap: null as Record<string, unknown> | null,
  interviewReadiness: null as number | null,
  careerPath: 'Software Engineer',
  roadmap: null as Record<string, unknown> | null,
  roadmapTasks: [] as RoadmapTask[],
  learningPlan: null as Record<string, unknown> | null,
  projectsBuilt: 0,
  learningHours: 0,
  trackedProjects: [] as TrackedProject[],
  documents: [] as UploadedDoc[],
  mentorChat: [] as ChatMessage[],
  jobPrepChat: [] as ChatMessage[],
  ragCollectionId: null as string | null,
  targetRole: 'Software Engineer',
  weeklyGoal: 'Complete onboarding & upload resume',
  timeline: [] as TimelineEvent[],
  achievements: [] as string[],
  scoreHistory: [] as ScoreHistoryEntry[],
  mockInterviews: [] as MockInterviewRecord[],
  weeklyGoalTargetHours: 10,
  weeklyHoursLogged: 0,
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function projectsCompleted(s: { trackedProjects: TrackedProject[]; projectsBuilt: number }) {
  const tracked = s.trackedProjects.filter((p) => p.status === 'completed').length
  return Math.max(tracked, s.projectsBuilt)
}

function scoreInputFromState(s: typeof initial & { roadmapTasks: RoadmapTask[] }) {
  const tasks = s.roadmapTasks
  const roadmapProgress =
    tasks.length === 0
      ? 0
      : Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)

  const resumeScore =
    s.resumeScore ?? (s.resumeAnalysis?.overall_score as number | undefined) ?? null
  const atsScore = s.atsScore ?? (s.resumeAnalysis?.ats_score as number | undefined) ?? null

  const readinessFromGap = s.skillGap?.readiness_score as number | undefined
  const matchPct = s.jobMatch?.match_percentage as number | undefined
  const skillGapReadiness = readinessFromGap ?? matchPct ?? null

  const weeklyGoalCompletion =
    s.weeklyGoalTargetHours > 0
      ? Math.min(100, Math.round((s.weeklyHoursLogged / s.weeklyGoalTargetHours) * 100))
      : 0

  const completed = projectsCompleted(s)
  const total = Math.max(s.trackedProjects.length, completed, 1)

  return {
    resumeScore,
    atsScore,
    roadmapProgress,
    projectsCompleted: completed,
    projectsTotal: total,
    interviewReadiness: s.interviewReadiness,
    learningHours: s.learningHours,
    skillGapReadiness,
    weeklyGoalCompletion,
  }
}

function calcCareerScore(s: typeof initial & { roadmapTasks: RoadmapTask[] }): number {
  return computeCareerScore(scoreInputFromState(s)).total
}

function pushTimeline(
  timeline: TimelineEvent[],
  type: string,
  title: string,
  detail?: string,
): TimelineEvent[] {
  return [
    { id: uid('evt'), type, title, detail, at: new Date().toISOString() },
    ...timeline,
  ].slice(0, 200)
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => {
      const runAchievementSync = () => {
        const s = get()
        // Week one = week-1 tasks, or first 4 month-1 topics
        const weekOneTasks = s.roadmapTasks.filter(
          (t) => t.week === 1 || t.id.includes('-w1-'),
        )
        const weekOnePool = weekOneTasks.length
          ? weekOneTasks
          : s.roadmapTasks.filter((t) => t.month === 1).slice(0, 4)
        const weekOneComplete =
          weekOnePool.length > 0 && weekOnePool.every((t) => t.status === 'completed')

        const unlocked = evaluateAchievements({
          hasResume: Boolean(s.resumeId || s.resumeText),
          hasAnalysis: Boolean(s.resumeAnalysis),
          hasJobMatch: Boolean(s.jobMatch),
          weekOneComplete,
          hasProject: s.trackedProjects.length > 0 || s.projectsBuilt > 0,
          interviewReady: (s.interviewReadiness ?? 0) >= 70,
          score80: calcCareerScore(s) >= 80,
          roadmap100: s.getRoadmapProgress() >= 100 && s.roadmapTasks.length > 0,
          hasRewrite: Boolean(s.resumeRewrite),
          mentorMessages: s.mentorChat.filter((m) => m.role === 'user').length,
        })

        const newly = unlocked.filter((id) => !s.achievements.includes(id))
        if (!newly.length) return

        let timeline = s.timeline
        newly.forEach((id) => {
          const def = ACHIEVEMENT_DEFS.find((a) => a.id === id)
          if (def) {
            celebrateAchievement(def.label)
            timeline = pushTimeline(timeline, 'achievement', def.label, def.description)
          }
        })
        set({ achievements: [...s.achievements, ...newly], timeline })
      }

      const recordScore = () => {
        const s = get()
        const breakdown = computeCareerScore(scoreInputFromState(s))
        const entry: ScoreHistoryEntry = {
          at: new Date().toISOString(),
          score: breakdown.total,
          breakdown: {
            resumeQuality: breakdown.resumeQuality,
            roadmap: breakdown.roadmap,
            projects: breakdown.projects,
            interview: breakdown.interview,
            learning: breakdown.learning,
            skillGap: breakdown.skillGap,
          },
        }
        const hist = s.scoreHistory
        const last = hist[0]
        // Avoid spamming identical scores within a few minutes
        if (last && last.score === entry.score) {
          const age = Date.now() - new Date(last.at).getTime()
          if (age < 60_000) return
        }
        set({ scoreHistory: [entry, ...hist].slice(0, 90) })
      }

      return {
        ...initial,

        setResumeUpload: ({ resumeId, filename, text }) => {
          set({
            resumeId,
            resumeFilename: filename,
            resumeText: text,
            documents: [
              ...get().documents.filter((d) => d.source !== 'resume'),
              {
                id: resumeId,
                filename,
                text,
                source: 'resume',
                uploadedAt: new Date().toISOString(),
              },
            ],
            timeline: pushTimeline(get().timeline, 'resume', 'Resume uploaded', filename),
          })
          runAchievementSync()
          recordScore()
        },

        setResumeAnalysis: (analysis) => {
          set({
            resumeAnalysis: analysis,
            resumeScore: Number(analysis.overall_score ?? 0),
            atsScore: Number(analysis.ats_score ?? 0),
            timeline: pushTimeline(
              get().timeline,
              'resume_analysis',
              'Resume analyzed',
              `Score ${analysis.overall_score} · ATS ${analysis.ats_score}`,
            ),
          })
          runAchievementSync()
          recordScore()
        },

        setResumeRewrite: (rewrite) => {
          set({
            resumeRewrite: rewrite,
            timeline: pushTimeline(get().timeline, 'resume_rewrite', 'ATS rewrite generated'),
          })
          runAchievementSync()
          recordScore()
        },

        setJobDescription: (jd) => set({ jobDescription: jd }),

        setJobMatch: (match) => {
          set({
            jobMatch: match,
            timeline: pushTimeline(
              get().timeline,
              'job_match',
              'Job match completed',
              `${match.match_percentage ?? ''}% match`,
            ),
          })
          runAchievementSync()
          recordScore()
        },

        setInterviewPrep: (data) => set({ interviewPrep: data }),

        setSkillGap: (data) => {
          set({
            skillGap: data,
            timeline: pushTimeline(get().timeline, 'skill_gap', 'Skill gap updated'),
          })
          recordScore()
        },

        setInterviewReadiness: (score) => {
          set({ interviewReadiness: score })
          runAchievementSync()
          recordScore()
        },

        setRoadmap: (roadmap, tasks) => {
          set({
            roadmap,
            roadmapTasks: tasks,
            timeline: pushTimeline(
              get().timeline,
              'roadmap',
              'Roadmap generated',
              `${tasks.length} topics`,
            ),
          })
          recordScore()
        },

        setTaskStatus: (taskId, status) => {
          const prev = get().roadmapTasks.find((t) => t.id === taskId)
          const tasks = get().roadmapTasks.map((t) =>
            t.id === taskId ? { ...t, status } : t,
          )
          let hours = get().learningHours
          let weeklyHours = get().weeklyHoursLogged
          let timeline = get().timeline

          if (status === 'completed' && prev?.status !== 'completed') {
            const add = prev?.hours || 1
            hours += add
            weeklyHours += add
            timeline = pushTimeline(timeline, 'task', `Completed: ${prev?.title}`, `Week ${prev?.week}`)
          }

          set({ roadmapTasks: tasks, learningHours: hours, weeklyHoursLogged: weeklyHours, timeline })
          runAchievementSync()
          recordScore()
        },

        setLearningPlan: (plan) => set({ learningPlan: plan }),

        addDocument: (doc) => {
          set({
            documents: [...get().documents, doc],
            timeline: pushTimeline(get().timeline, 'pdf', 'PDF added to library', doc.filename),
          })
        },

        removeDocument: (id) =>
          set({ documents: get().documents.filter((d) => d.id !== id) }),

        renameDocument: (id, filename) =>
          set({
            documents: get().documents.map((d) => (d.id === id ? { ...d, filename } : d)),
          }),

        setMentorChat: (msgs) => set({ mentorChat: msgs }),
        appendMentorChat: (msg) => {
          set({ mentorChat: [...get().mentorChat, { ...msg, at: new Date().toISOString() }] })
          if (msg.role === 'user') runAchievementSync()
        },

        setJobPrepChat: (msgs) => set({ jobPrepChat: msgs }),
        appendJobPrepChat: (msg) =>
          set({
            jobPrepChat: [...get().jobPrepChat, { ...msg, at: new Date().toISOString() }],
          }),

        setRagCollectionId: (id) => set({ ragCollectionId: id }),
        setCareerPath: (path) => set({ careerPath: path }),
        setTargetRole: (role) => set({ targetRole: role }),
        setWeeklyGoal: (goal) => set({ weeklyGoal: goal }),
        addLearningHours: (h) => {
          set({
            learningHours: get().learningHours + h,
            weeklyHoursLogged: get().weeklyHoursLogged + h,
          })
          recordScore()
        },
        incrementProjects: () => {
          set({ projectsBuilt: get().projectsBuilt + 1 })
          runAchievementSync()
          recordScore()
        },

        upsertTrackedProjects: (projects) => {
          const existing = get().trackedProjects
          const titles = new Set(existing.map((p) => p.title))
          const added: TrackedProject[] = projects
            .filter((p) => !titles.has(p.title))
            .map((p) => ({
              ...p,
              id: uid('proj'),
              status: 'planning' as ProjectStatus,
              githubUrl: '',
              completionDate: null,
              createdAt: new Date().toISOString(),
            }))
          if (!added.length) return
          set({
            trackedProjects: [...added, ...existing],
            projectsBuilt: Math.max(get().projectsBuilt, existing.length + added.length),
            timeline: pushTimeline(
              get().timeline,
              'projects',
              `Added ${added.length} project(s)`,
              added.map((a) => a.title).join(', '),
            ),
          })
          runAchievementSync()
          recordScore()
        },

        updateTrackedProject: (id, patch) => {
          const projects = get().trackedProjects.map((p) => {
            if (p.id !== id) return p
            const next = { ...p, ...patch }
            if (patch.status === 'completed' && !next.completionDate) {
              next.completionDate = new Date().toISOString().slice(0, 10)
            }
            return next
          })
          const completed = projects.filter((p) => p.status === 'completed').length
          let timeline = get().timeline
          const was = get().trackedProjects.find((p) => p.id === id)
          if (patch.status === 'completed' && was?.status !== 'completed') {
            timeline = pushTimeline(timeline, 'project_done', `Project completed: ${was?.title}`)
          }
          set({
            trackedProjects: projects,
            projectsBuilt: Math.max(get().projectsBuilt, completed),
            timeline,
          })
          runAchievementSync()
          recordScore()
        },

        addMockInterview: (record) => {
          const entry: MockInterviewRecord = { ...record, id: uid('iv') }
          set({
            mockInterviews: [entry, ...get().mockInterviews].slice(0, 50),
            interviewReadiness: Math.max(get().interviewReadiness ?? 0, record.score),
            timeline: pushTimeline(
              get().timeline,
              'interview',
              `Mock interview: ${record.role}`,
              `Score ${record.score}`,
            ),
          })
          runAchievementSync()
          recordScore()
        },

        addTimelineEvent: (type, title, detail) =>
          set({ timeline: pushTimeline(get().timeline, type, title, detail) }),

        syncAchievements: () => runAchievementSync(),
        recordScoreSnapshot: () => recordScore(),

        resetWorkspace: () => set({ ...initial }),

        getCareerScore: () => calcCareerScore(get()),

        getScoreSnapshot: () => {
          const s = get()
          const breakdown = computeCareerScore(scoreInputFromState(s))
          const current = breakdown.total
          const hist = s.scoreHistory
          const previous = hist[1]?.score ?? hist[0]?.score ?? current

          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
          const weekEntry = [...hist].reverse().find((h) => new Date(h.at).getTime() <= weekAgo)
          const monthEntry = [...hist].reverse().find((h) => new Date(h.at).getTime() <= monthAgo)

          return {
            current,
            previous,
            weeklyDelta: current - (weekEntry?.score ?? previous),
            monthlyDelta: current - (monthEntry?.score ?? Math.max(0, current - 10)),
            breakdown,
          }
        },

        getRoadmapProgress: () => {
          const tasks = get().roadmapTasks
          if (!tasks.length) return 0
          return Math.round(
            (tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100,
          )
        },

        getCompletedTaskCount: () =>
          get().roadmapTasks.filter((t) => t.status === 'completed').length,

        getNextTask: () => {
          const pending = get().roadmapTasks.find(
            (t) => t.status === 'pending' || t.status === 'in_progress',
          )
          return pending || null
        },

        getRecommendations: () => {
          const s = get()
          const missing = (
            (s.skillGap?.missing_skills as Array<{ skill?: string } | string>) || []
          )
            .map((m) => (typeof m === 'string' ? m : m.skill || ''))
            .filter(Boolean) as string[]

          return getRecommendations({
            hasResume: Boolean(s.resumeId || s.resumeText),
            hasAnalysis: Boolean(s.resumeAnalysis),
            resumeScore: s.resumeScore,
            hasRoadmap: Boolean(s.roadmap),
            roadmapProgress: s.getRoadmapProgress(),
            nextTaskTitle: s.getNextTask()?.title || null,
            hasJobMatch: Boolean(s.jobMatch),
            interviewReadiness: s.interviewReadiness,
            projectsCompleted: projectsCompleted(s),
            missingSkills: missing,
            careerScore: calcCareerScore(s),
          })
        },

        getWeeklyReportData: () => {
          const s = get()
          const snap = s.getScoreSnapshot()
          const completedThisWeek = s.timeline.filter((e) => {
            const age = Date.now() - new Date(e.at).getTime()
            return age < 7 * 24 * 60 * 60 * 1000 && (e.type === 'task' || e.type === 'project_done')
          })
          const recs = s.getRecommendations()
          return {
            career_path: s.careerPath,
            target_role: s.targetRole,
            career_score: snap.current,
            previous_score: snap.previous,
            weekly_delta: snap.weeklyDelta,
            monthly_delta: snap.monthlyDelta,
            breakdown: snap.breakdown,
            roadmap_progress: s.getRoadmapProgress(),
            learning_hours: s.learningHours,
            weekly_hours: s.weeklyHoursLogged,
            interview_readiness: s.interviewReadiness ?? 0,
            resume_score: s.resumeScore ?? 0,
            ats_score: s.atsScore ?? 0,
            achievements: s.achievements.map(
              (id) => ACHIEVEMENT_DEFS.find((a) => a.id === id)?.label || id,
            ),
            skills_learned: s.roadmapTasks
              .filter((t) => t.status === 'completed')
              .slice(-8)
              .map((t) => t.title),
            recent_wins: completedThisWeek.map((e) => e.title),
            recommended_focus: recs[0]?.title || 'Keep shipping weekly progress',
            motivational_summary: `You're at Career Score ${snap.current}. ${
              snap.weeklyDelta >= 0
                ? `Up ${snap.weeklyDelta} points this week — keep the momentum.`
                : 'Refocus on one high-impact task this week.'
            }`,
          }
        },

        getAnalytics: () => {
          const s = get()
          const score = calcCareerScore(s)
          const progress = s.getRoadmapProgress()
          const completed = s.getCompletedTaskCount()
          const weeklyTasks = s.roadmapTasks.filter((t) => t.week <= 4)
          const weeklyDone = weeklyTasks.filter((t) => t.status === 'completed').length
          const weeklyCompletion = weeklyTasks.length
            ? Math.round((weeklyDone / weeklyTasks.length) * 100)
            : 0
          const month1 = s.roadmapTasks.filter((t) => t.month === 1)
          const month1Done = month1.filter((t) => t.status === 'completed').length
          const monthlyCompletion = month1.length
            ? Math.round((month1Done / month1.length) * 100)
            : progress

          const resumeScore = s.resumeScore ?? 0
          const resumeImprovement = Math.max(0, resumeScore - 40)
          const projCount = projectsCompleted(s)

          const hist = [...s.scoreHistory].slice(0, 4).reverse()
          const careerProgress =
            hist.length >= 2
              ? hist.map((h, i) => ({
                  week: `S${i + 1}`,
                  score: h.score,
                }))
              : [
                  { week: 'W1', score: Math.max(20, score - 15) },
                  { week: 'W2', score: Math.max(25, score - 10) },
                  { week: 'W3', score: Math.max(30, score - 5) },
                  { week: 'W4', score },
                ]

          return {
            careerProgress,
            skillsCompletedMonthly: [
              { month: 'M1', count: Math.min(completed, 4) },
              { month: 'M2', count: Math.min(completed, 8) },
              { month: 'M3', count: Math.min(completed, 12) },
              { month: 'M4', count: completed },
            ],
            learningHoursMonthly: [
              { month: 'M1', hours: Math.round(s.learningHours * 0.25) },
              { month: 'M2', hours: Math.round(s.learningHours * 0.5) },
              { month: 'M3', hours: Math.round(s.learningHours * 0.75) },
              { month: 'M4', hours: s.learningHours },
            ],
            projectsTimeline: [
              { month: 'M1', count: Math.min(projCount, 1) },
              { month: 'M2', count: Math.min(projCount, 2) },
              { month: 'M3', count: Math.min(projCount, 3) },
              { month: 'M4', count: projCount },
            ],
            resumeScores: [
              { date: 'Start', score: Math.max(30, resumeScore - 20) },
              { date: 'After analyze', score: resumeScore || 45 },
              {
                date: 'After rewrite',
                score: s.resumeRewrite ? Math.min(100, resumeScore + 10) : resumeScore,
              },
              { date: 'Now', score: resumeScore || 40 },
            ],
            weeklyCompletion,
            monthlyCompletion,
            interviewReadiness: s.interviewReadiness ?? 0,
            resumeImprovement,
            roadmapProgress: progress,
            completedSkills: completed,
            completedProjects: projCount,
            hoursStudied: s.learningHours,
            aiUsage:
              s.mentorChat.length +
              s.jobPrepChat.length +
              (s.resumeAnalysis ? 1 : 0) +
              (s.jobMatch ? 1 : 0) +
              (s.roadmap ? 1 : 0),
          }
        },
      }
    },
    {
      name: 'careergps_workspace_v1',
      partialize: (s) => ({
        resumeId: s.resumeId,
        resumeFilename: s.resumeFilename,
        resumeText: s.resumeText,
        resumeAnalysis: s.resumeAnalysis,
        resumeRewrite: s.resumeRewrite,
        resumeScore: s.resumeScore,
        atsScore: s.atsScore,
        jobDescription: s.jobDescription,
        jobMatch: s.jobMatch,
        interviewPrep: s.interviewPrep,
        skillGap: s.skillGap,
        interviewReadiness: s.interviewReadiness,
        careerPath: s.careerPath,
        roadmap: s.roadmap,
        roadmapTasks: s.roadmapTasks,
        learningPlan: s.learningPlan,
        projectsBuilt: s.projectsBuilt,
        learningHours: s.learningHours,
        trackedProjects: s.trackedProjects,
        documents: s.documents,
        mentorChat: s.mentorChat,
        jobPrepChat: s.jobPrepChat,
        ragCollectionId: s.ragCollectionId,
        targetRole: s.targetRole,
        weeklyGoal: s.weeklyGoal,
        timeline: s.timeline,
        achievements: s.achievements,
        scoreHistory: s.scoreHistory,
        mockInterviews: s.mockInterviews,
        weeklyGoalTargetHours: s.weeklyGoalTargetHours,
        weeklyHoursLogged: s.weeklyHoursLogged,
      }),
    },
  ),
)

/** Build checklist tasks from monthly topics (source of truth). */
export function tasksFromRoadmap(roadmap: Record<string, unknown>): RoadmapTask[] {
  const monthly = (roadmap.monthly_timeline as Array<Record<string, unknown>>) || []
  const tasks: RoadmapTask[] = []
  let weekCounter = 1

  monthly.forEach((month) => {
    const monthNum = Number(month.month ?? 1)
    const topics: string[] =
      (month.topics as string[]) ||
      (month.skills_to_master as string[]) ||
      (month.milestones as string[]) ||
      []

    topics.forEach((title, idx) => {
      const weekInMonth = idx + 1
      const globalWeek = (monthNum - 1) * 4 + weekInMonth
      tasks.push({
        id: `m${monthNum}-w${weekInMonth}-${idx}-${title.slice(0, 24)}`,
        month: monthNum,
        week: globalWeek || weekCounter,
        title,
        status: 'pending',
        hours: Number(month.hours_per_topic ?? 4),
      })
      weekCounter += 1
    })
  })

  if (!tasks.length) {
    const weekly = (roadmap.weekly_timeline as Array<Record<string, unknown>>) || []
    weekly.forEach((w, i) => {
      const focus = String(w.focus || `Week ${w.week}`)
      const subtasks = (w.tasks as string[]) || [focus]
      subtasks.forEach((title, j) => {
        tasks.push({
          id: `w${w.week}-${j}-${title.slice(0, 24)}`,
          month: Math.ceil(Number(w.week || i + 1) / 4),
          week: Number(w.week || i + 1),
          title,
          status: 'pending',
          hours: Number(w.hours ?? 4),
        })
      })
    })
  }

  return tasks
}

export function buildMentorContext(): string {
  const s = useWorkspace.getState()
  const next = s.getNextTask()
  const snap = s.getScoreSnapshot()
  const completed = s.roadmapTasks.filter((t) => t.status === 'completed').map((t) => t.title)
  const pending = s.roadmapTasks
    .filter((t) => t.status === 'pending' || t.status === 'in_progress')
    .slice(0, 5)
    .map((t) => t.title)
  const recs = s.getRecommendations()
  const lastInterview = s.mockInterviews[0]
  const activeProject = s.trackedProjects.find((p) => p.status === 'in_progress' || p.status === 'started')

  const yesterday = completed.slice(-1)[0]
  const proactive = [
    yesterday
      ? `You recently completed "${yesterday}". Today I recommend: ${next?.title || 'continue your roadmap'}.`
      : null,
    snap.weeklyDelta !== 0
      ? `Career Score change this period: ${snap.weeklyDelta > 0 ? '+' : ''}${snap.weeklyDelta} (now ${snap.current}).`
      : `Current Career Score: ${snap.current}.`,
    s.atsScore != null && s.resumeScore != null
      ? `Resume ${s.resumeScore} / ATS ${s.atsScore}.`
      : null,
    `You are roughly ${s.interviewReadiness ?? Math.round(snap.current * 0.8)}% ready for a ${s.targetRole} role.`,
    recs[0] ? `Next best action: ${recs[0].title} — ${recs[0].reason}` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return [
    `=== CAREER OS MEMORY (use this — be a proactive coach, not generic) ===`,
    `Proactive briefing: ${proactive}`,
    `Career path: ${s.careerPath}`,
    `Target role: ${s.targetRole}`,
    `Career score: ${snap.current} (prev ${snap.previous}, weekly Δ ${snap.weeklyDelta}, monthly Δ ${snap.monthlyDelta})`,
    `Score breakdown: resume ${snap.breakdown.resumeQuality}, roadmap ${snap.breakdown.roadmap}, projects ${snap.breakdown.projects}, interview ${snap.breakdown.interview}, learning ${snap.breakdown.learning}, skill gap ${snap.breakdown.skillGap}`,
    `Resume score: ${s.resumeScore ?? 'n/a'} | ATS: ${s.atsScore ?? 'n/a'}`,
    `Interview readiness: ${s.interviewReadiness ?? 'n/a'}`,
    `Last mock interview: ${
      lastInterview
        ? `${lastInterview.role} score ${lastInterview.score}; weak: ${lastInterview.weakAreas.join(', ') || 'n/a'}; strong: ${lastInterview.strongAreas.join(', ') || 'n/a'}`
        : 'none yet'
    }`,
    `Job match %: ${(s.jobMatch?.match_percentage as number) ?? 'n/a'}`,
    `Current JD snippet: ${(s.jobDescription || '').slice(0, 400) || 'none'}`,
    `Roadmap progress: ${s.getRoadmapProgress()}%`,
    `Completed topics: ${completed.join(', ') || 'none yet'}`,
    `Upcoming topics: ${pending.join(', ') || 'none'}`,
    `Next recommended task: ${next?.title || 'Generate a roadmap'}`,
    `Learning hours: ${s.learningHours} (weekly logged ${s.weeklyHoursLogged}/${s.weeklyGoalTargetHours})`,
    `Weekly goal: ${s.weeklyGoal}`,
    `Projects: ${s.trackedProjects.map((p) => `${p.title} [${p.status}]`).join('; ') || `count ${s.projectsBuilt}`}`,
    `Active project: ${activeProject?.title || 'none'}`,
    `Achievements: ${s.achievements.join(', ') || 'none'}`,
    `Missing skills: ${((s.skillGap?.missing_skills as Array<{ skill?: string }>) || [])
      .slice(0, 5)
      .map((m) => (typeof m === 'string' ? m : m.skill))
      .filter(Boolean)
      .join(', ') || 'n/a'}`,
    `Resume filename: ${s.resumeFilename || 'none'}`,
    `Uploaded docs: ${s.documents.map((d) => d.filename).join(', ') || 'none'}`,
    `Coach style: celebrate progress, name specific next skills, reference scores and roadmap weeks.`,
  ].join('\n')
}
