import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Loader2,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles,
  Trophy,
  Star,
  Compass,
  Rocket,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/input'
import { bonusApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { cn, scoreColor } from '@/lib/utils'

interface AnalyticsData {
  career_progress?: { week: string; score: number }[]
  skills_completed_monthly?: { month: string; count: number }[]
  learning_hours_monthly?: { month: string; hours: number }[]
  projects_timeline?: { month: string; count: number }[]
  resume_scores?: { date: string; score: number }[]
}

interface WeeklyInsights {
  week_summary?: string
  wins?: string[]
  areas_to_focus?: string[]
  recommended_actions?: { action: string; why: string; estimated_time: string }[]
  motivation_message?: string
  career_confidence_delta?: number
  next_week_focus?: string
}

const BADGE_META: Record<
  string,
  { label: string; icon: typeof Trophy; color: string }
> = {
  newcomer: { label: 'Newcomer', icon: Star, color: 'from-primary/20 to-primary/5 border-primary/30' },
  explorer: { label: 'Explorer', icon: Compass, color: 'from-secondary/20 to-secondary/5 border-secondary/30' },
  builder: { label: 'Builder', icon: Rocket, color: 'from-accent/20 to-accent/5 border-accent/30' },
  achiever: { label: 'Achiever', icon: Trophy, color: 'from-amber-500/20 to-amber-500/5 border-amber-500/30' },
  mentor_ready: { label: 'Mentor Ready', icon: Target, color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30' },
}

const chartTooltipStyle = {
  contentStyle: {
    background: 'rgba(14, 14, 22, 0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    fontSize: '12px',
  },
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<WeeklyInsights | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analytics = useMemo(
    () => (user?.analytics || {}) as AnalyticsData,
    [user?.analytics],
  )

  const careerProgress = analytics.career_progress || []
  const skillsCompleted = analytics.skills_completed_monthly || []
  const learningHours = analytics.learning_hours_monthly || []
  const projectsTimeline = analytics.projects_timeline || []
  const resumeScores = analytics.resume_scores || []

  const fetchInsights = async () => {
    setInsightsLoading(true)
    setError(null)
    try {
      const activityData = JSON.stringify({
        weekly_activity: user?.weekly_activity,
        learning_hours: user?.learning_hours,
        projects_built: user?.projects_built,
        completed_skills: user?.completed_skills,
        roadmap_progress: user?.roadmap_progress,
      })
      const { data } = await bonusApi.insights({
        activity_data: activityData,
        career_path: user?.career_path || 'Software Engineer',
        career_score: user?.career_score || 50,
      })
      setInsights(data as WeeklyInsights)
      toast.success('Weekly insights generated!')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load insights'
      setError(msg)
      toast.error(msg)
    } finally {
      setInsightsLoading(false)
    }
  }

  const badges = user?.badges || []

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Career Analytics</h1>
              <p className="mt-1 text-muted-foreground">
                Track progress, learning hours, projects, and resume improvements.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-5 py-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Career score</p>
              <p className={cn('text-2xl font-bold', scoreColor(user?.career_score || 0))}>
                {user?.career_score ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievement badges */}
      <Card className="border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-amber-400" />
            Achievement badges
          </CardTitle>
          <CardDescription>Milestones you've unlocked on your career journey</CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => {
                const meta = BADGE_META[badge] || {
                  label: badge.replace(/_/g, ' '),
                  icon: Star,
                  color: 'from-muted to-muted border-border',
                }
                const Icon = meta.icon
                return (
                  <motion.div
                    key={badge}
                    whileHover={{ scale: 1.03 }}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border bg-gradient-to-br px-4 py-3',
                      meta.color,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-semibold capitalize">{meta.label}</span>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete tasks and milestones to earn badges.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Career progress" description="Weekly career score trend">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={careerProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip {...chartTooltipStyle} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#7c3aed', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Skills completed" description="Monthly skills mastered">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={skillsCompleted}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Learning hours" description="Monthly study time">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={learningHours}>
              <defs>
                <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip {...chartTooltipStyle} />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#06b6d4"
                fill="url(#hoursGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Projects timeline" description="Projects built per month">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectsTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Resume score trend"
          description="ATS & quality improvements over time"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={resumeScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name="Resume score"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Weekly insights */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Weekly AI insights
              </CardTitle>
              <CardDescription>Personalized recommendations based on your activity</CardDescription>
            </div>
            <Button onClick={fetchInsights} disabled={insightsLoading}>
              {insightsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get weekly insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                {error}
              </div>
              <Button variant="outline" size="sm" onClick={fetchInsights}>
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {insights ? (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {insights.week_summary && (
                  <p className="text-sm leading-relaxed">{insights.week_summary}</p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {insights.wins && insights.wins.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase text-emerald-400">Wins</p>
                      <ul className="space-y-1 text-sm">
                        {insights.wins.map((w) => (
                          <li key={w}>✓ {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insights.areas_to_focus && insights.areas_to_focus.length > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase text-amber-400">
                        Focus areas
                      </p>
                      <ul className="space-y-1 text-sm">
                        {insights.areas_to_focus.map((a) => (
                          <li key={a}>→ {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {insights.recommended_actions && insights.recommended_actions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Recommended actions
                    </p>
                    {insights.recommended_actions.map((action) => (
                      <div
                        key={action.action}
                        className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border bg-card/60 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{action.action}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{action.why}</p>
                        </div>
                        <Badge variant="outline">{action.estimated_time}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {insights.career_confidence_delta != null && (
                    <Badge variant="success">
                      +{insights.career_confidence_delta} confidence this week
                    </Badge>
                  )}
                  {insights.next_week_focus && (
                    <p className="text-sm text-muted-foreground">
                      Next week: <span className="font-medium text-foreground">{insights.next_week_focus}</span>
                    </p>
                  )}
                </div>
                {insights.motivation_message && (
                  <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm italic">
                    "{insights.motivation_message}"
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground"
              >
                Click the button above to generate AI-powered weekly insights tailored to your
                activity and career path.
              </motion.p>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('border-border/80 bg-card/70', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
