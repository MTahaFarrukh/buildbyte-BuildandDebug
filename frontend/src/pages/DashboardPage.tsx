import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award,
  CheckCircle2,
  Clock,
  FileDown,
  FileText,
  Map,
  MessageSquare,
  Rocket,
  RotateCcw,
  ArrowRight,
  Target,
  TrendingUp,
  Sparkles,
  Library,
  History,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/input'
import { Progress, ProgressCircle } from '@/components/ui/progress'
import { RecommendationBanner, AchievementsRow } from '@/components/RecommendationBanner'
import { useAuth } from '@/context/AuthContext'
import { bonusApi, downloadBase64Pdf } from '@/lib/api'
import { ACHIEVEMENT_DEFS } from '@/lib/careerEngine'
import { useWorkspace } from '@/store/workspace'
import { scoreColor, cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const resumeScore = useWorkspace((s) => s.resumeScore)
  const atsScore = useWorkspace((s) => s.atsScore)
  const interviewReadiness = useWorkspace((s) => s.interviewReadiness)
  const learningHours = useWorkspace((s) => s.learningHours)
  const projectsBuilt = useWorkspace((s) => s.projectsBuilt)
  const careerPath = useWorkspace((s) => s.careerPath)
  const targetRole = useWorkspace((s) => s.targetRole)
  const weeklyGoal = useWorkspace((s) => s.weeklyGoal)
  const roadmap = useWorkspace((s) => s.roadmap)
  const roadmapTasks = useWorkspace((s) => s.roadmapTasks) ?? []
  const trackedProjects = useWorkspace((s) => s.trackedProjects) ?? []
  const mentorChat = useWorkspace((s) => s.mentorChat) ?? []
  const achievements = useWorkspace((s) => s.achievements) ?? []
  const resetWorkspace = useWorkspace((s) => s.resetWorkspace)
  const getScoreSnapshot = useWorkspace((s) => s.getScoreSnapshot)
  const getRoadmapProgress = useWorkspace((s) => s.getRoadmapProgress)
  const getNextTask = useWorkspace((s) => s.getNextTask)
  const getAnalytics = useWorkspace((s) => s.getAnalytics)
  const getCompletedTaskCount = useWorkspace((s) => s.getCompletedTaskCount)
  const getRecommendations = useWorkspace((s) => s.getRecommendations)
  const getWeeklyReportData = useWorkspace((s) => s.getWeeklyReportData)

  const snap = getScoreSnapshot()
  const progress = getRoadmapProgress()
  const next = getNextTask()
  const analytics = getAnalytics()
  const completed = getCompletedTaskCount()
  const pending = roadmapTasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped')
  const activeProject =
    trackedProjects.find((p) => p.status === 'in_progress' || p.status === 'started') ||
    trackedProjects[0]
  const recentChat = [...mentorChat].slice(-4).reverse()
  const recs = getRecommendations()
  const displayName = (user?.full_name?.trim() || user?.email?.split('@')[0]?.trim() || 'Explorer')
    .split(' ')[0]
  const displayRole = [
    targetRole,
    careerPath,
    user?.career_path,
    user?.full_name ? undefined : undefined,
  ]
    .map((value) => value?.trim())
    .find((value): value is string => {
      if (!value) return false
      return !['Software Engineer', 'Software Engineering'].includes(value)
    }) || user?.career_path?.trim() || targetRole || careerPath || 'Set your target role'

  const reset = () => {
    if (!confirm('Reset workspace? This clears resume analysis, roadmaps, chats, and progress.'))
      return
    resetWorkspace()
    toast.success('Workspace reset')
  }

  const exportWeekly = async () => {
    try {
      const payload = getWeeklyReportData()
      const { data } = await bonusApi.weeklyReport(payload)
      if (data.pdf_base64) {
        downloadBase64Pdf(data.pdf_base64, data.filename || 'CareerGPS_Weekly_Report.pdf')
        toast.success('Weekly report downloaded')
      }
    } catch {
      toast.error('Could not generate weekly report PDF')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}</h1>
          <p className="mt-1 text-muted-foreground">
            Your career command center · Goal:{' '}
            <span className="font-medium text-foreground">{displayRole}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={exportWeekly}>
            <FileDown className="h-4 w-4" /> Weekly Report
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </motion.div>

      <RecommendationBanner />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6">
            <ProgressCircle value={snap.current} label="Career Score" size={150} />
            <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Previous</p>
                <p className="text-lg font-bold">{snap.previous}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Weekly</p>
                <p
                  className={cn(
                    'text-lg font-bold',
                    snap.weeklyDelta >= 0 ? 'text-emerald-500' : 'text-rose-500',
                  )}
                >
                  {snap.weeklyDelta >= 0 ? '+' : ''}
                  {snap.weeklyDelta}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly</p>
                <p
                  className={cn(
                    'text-lg font-bold',
                    snap.monthlyDelta >= 0 ? 'text-emerald-500' : 'text-rose-500',
                  )}
                >
                  {snap.monthlyDelta >= 0 ? '+' : ''}
                  {snap.monthlyDelta}
                </p>
              </div>
            </div>
            <div className="mt-4 w-full space-y-1.5 text-xs text-muted-foreground">
              {[
                ['Resume', snap.breakdown.resumeQuality, 25],
                ['Roadmap', snap.breakdown.roadmap, 20],
                ['Projects', snap.breakdown.projects, 20],
                ['Interview', snap.breakdown.interview, 15],
                ['Learning', snap.breakdown.learning, 10],
                ['Skill gap', snap.breakdown.skillGap, 10],
              ].map(([label, val, wt]) => (
                <div key={String(label)} className="flex items-center gap-2">
                  <span className="w-16 shrink-0">{label}</span>
                  <Progress value={Number(val)} className="h-1.5 flex-1" />
                  <span className="w-10 text-right tabular-nums">{val}</span>
                  <span className="w-8 text-right opacity-60">{wt}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {[
            { label: 'Resume Score', value: resumeScore ?? 0, icon: Award, href: '/app/resume' },
            { label: 'ATS Score', value: atsScore ?? 0, icon: TrendingUp, href: '/app/resume' },
            {
              label: 'Interview Ready',
              value: interviewReadiness ?? 0,
              icon: Target,
              href: '/app/job-prep',
            },
            { label: 'Roadmap', value: progress, icon: Map, href: '/app/roadmap' },
          ].map((s) => (
            <Link key={s.label} to={s.href}>
              <Card className="glass h-full transition hover:border-primary/40">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <s.icon className="h-4 w-4" />
                    <span className="text-xs">{s.label}</span>
                  </div>
                  <p className={`mt-3 text-3xl font-bold ${scoreColor(s.value)}`}>{s.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Card className="glass sm:col-span-2">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Hours studied</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
                  <Clock className="h-5 w-5 text-accent" /> {learningHours}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Projects</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
                  <Rocket className="h-5 w-5 text-secondary" />{' '}
                  {trackedProjects.filter((p) => p.status === 'completed').length || projectsBuilt}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Skills completed</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> {completed}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {achievements.length > 0 && (
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Achievements</CardTitle>
            <CardDescription>
              {achievements.length} / {ACHIEVEMENT_DEFS.length} unlocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AchievementsRow limit={12} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" /> Today&apos;s focus
            </CardTitle>
            <CardDescription>
              {careerPath} · Weekly goal: {weeklyGoal}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Next task</p>
              <p className="mt-1 font-semibold">
                {next?.title || 'Generate a roadmap to unlock daily tasks'}
              </p>
              <Button asChild size="sm" className="mt-3" variant="secondary">
                <Link to="/app/roadmap">
                  {next ? 'Continue' : 'Create Roadmap'} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {pending.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="truncate">{t.title}</span>
                  <Badge variant="outline">
                    {t.status === 'in_progress' ? '◐' : '☐'} W{t.week}
                  </Badge>
                </div>
              ))}
              {!pending.length && !roadmap && (
                <p className="text-sm text-muted-foreground">
                  No roadmap yet — create one to populate today&apos;s tasks.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-secondary" /> Active project
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeProject ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold">{activeProject.title}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{activeProject.status.replace('_', ' ')}</Badge>
                  <Badge variant="outline">{activeProject.difficulty}</Badge>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/projects">Update progress</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No tracked projects yet. Generate portfolio projects to boost Career Score.
                </p>
                <Button asChild size="sm">
                  <Link to="/app/projects">Generate Projects</Link>
                </Button>
              </div>
            )}
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" /> Recent AI conversations
              </p>
              {recentChat.length ? (
                <ul className="space-y-2">
                  {recentChat.map((m, i) => (
                    <li key={i} className="truncate text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{m.role}:</span> {m.content}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No mentor chats yet.{' '}
                  <Link className="text-primary underline" to="/app/chat">
                    Ask your AI coach
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> Weekly learning hours
          </CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.learningHoursMonthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="hours" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {[
          { to: '/app/resume', label: 'Resume AI', icon: FileText },
          { to: '/app/job-prep', label: 'Job Prep', icon: Target },
          { to: '/app/chat', label: 'AI Mentor', icon: MessageSquare },
          { to: '/app/timeline', label: 'Timeline', icon: History },
          { to: '/app/library', label: 'PDF Library', icon: Library },
          { to: '/app/analytics', label: 'Analytics', icon: TrendingUp },
        ].map((a) => (
          <Button key={a.to} asChild variant="outline" size="sm">
            <Link to={a.to}>
              <a.icon className="h-4 w-4" /> {a.label}
            </Link>
          </Button>
        ))}
        {recs.slice(1, 3).map((r) => (
          <Button key={r.id} asChild variant="ghost" size="sm">
            <Link to={r.href}>{r.cta}</Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
