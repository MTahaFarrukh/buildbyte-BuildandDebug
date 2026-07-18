import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Map,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/input'
import {
  EmptyState,
  Progress,
  ProgressCircle,
  Skeleton,
} from '@/components/ui/progress'
import { useAuth } from '@/context/AuthContext'
import { cn, scoreColor } from '@/lib/utils'

const BADGE_META: Record<string, { label: string; icon: typeof Trophy }> = {
  newcomer: { label: 'Newcomer', icon: Sparkles },
  explorer: { label: 'Explorer', icon: Map },
  resume_pro: { label: 'Resume Pro', icon: BookOpen },
  streak_7: { label: '7-Day Streak', icon: Flame },
  project_builder: { label: 'Project Builder', icon: Rocket },
  interview_ready: { label: 'Interview Ready', icon: Target },
}

const statCards = [
  { key: 'learning_hours', label: 'Learning Hours', icon: Clock, suffix: 'h' },
  { key: 'projects_built', label: 'Projects Built', icon: Rocket, suffix: '' },
  { key: 'resume_improvements', label: 'Resume Edits', icon: TrendingUp, suffix: '' },
  { key: 'completed_skills', label: 'Skills Done', icon: CheckCircle2, suffix: '', isArray: true },
] as const

export default function DashboardPage() {
  const { user, loading: authLoading, refreshProfile } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setRefreshing(true)
      setError(null)
      try {
        await refreshProfile()
      } catch {
        if (!cancelled) setError('Could not refresh your dashboard. Showing cached data.')
      } finally {
        if (!cancelled) setRefreshing(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [refreshProfile])

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)
    try {
      await refreshProfile()
      toast.success('Dashboard updated')
    } catch {
      setError('Refresh failed. Please try again.')
      toast.error('Could not refresh dashboard')
    } finally {
      setRefreshing(false)
    }
  }

  const careerScore = user?.career_score ?? 0
  const roadmapProgress = user?.roadmap_progress ?? 0
  const weeklyActivity = user?.weekly_activity ?? []
  const upcomingTasks = user?.upcoming_tasks ?? []
  const recommendedSkills = user?.recommended_skills ?? []
  const badges = user?.badges ?? []
  const completedSkillsCount = user?.completed_skills?.length ?? 0

  const chartData = useMemo(
    () =>
      weeklyActivity.length > 0
        ? weeklyActivity
        : [
            { day: 'Mon', hours: 0 },
            { day: 'Tue', hours: 0 },
            { day: 'Wed', hours: 0 },
            { day: 'Thu', hours: 0 },
            { day: 'Fri', hours: 0 },
            { day: 'Sat', hours: 0 },
            { day: 'Sun', hours: 0 },
          ],
    [weeklyActivity],
  )

  const totalWeeklyHours = chartData.reduce((sum, d) => sum + d.hours, 0)

  if (authLoading && !user) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (!user) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Sign in to view your dashboard"
        description="Your career score, tasks, and progress live here once you're logged in."
        action={
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Hey, {user.full_name?.split(' ')[0] || 'Explorer'} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user.career_path || 'Set your career path'} · Keep the momentum going
          </p>
        </motion.div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      {/* Hero row: score + stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-1"
        >
          <Card className="glass relative overflow-hidden border-primary/20">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Career Score
              </CardTitle>
              <CardDescription>Your overall job-readiness index</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              <ProgressCircle value={careerScore} size={140} stroke={12} label="Score" />
              <p className={cn('mt-4 text-center text-sm font-medium', scoreColor(careerScore))}>
                {careerScore >= 80
                  ? 'Excellent — interview ready!'
                  : careerScore >= 60
                    ? 'Good progress — keep building'
                    : careerScore >= 40
                      ? 'Growing — focus on key gaps'
                      : 'Getting started — upload your resume'}
              </p>
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link to="/app/resume">Improve score</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            let value: string | number = 0
            if (stat.key === 'completed_skills') {
              value = completedSkillsCount
            } else if (stat.key === 'learning_hours') {
              value = user.learning_hours ?? 0
            } else if (stat.key === 'projects_built') {
              value = user.projects_built ?? 0
            } else if (stat.key === 'resume_improvements') {
              value = user.resume_improvements ?? 0
            }
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05 }}
              >
                <Card className="h-full border-border/80 bg-card/60 transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">
                        {value}
                        {stat.suffix}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Roadmap + Weekly goal + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-secondary" />
                Roadmap Progress
              </CardTitle>
              <CardDescription>Your personalized learning path</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-semibold">{roadmapProgress}%</span>
              </div>
              <Progress value={roadmapProgress} className="h-3" />
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild size="sm">
                  <Link to="/app/roadmap">View roadmap</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/planner">Open planner</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Card className="glass h-full border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.weekly_goal ? (
                <p className="text-sm leading-relaxed">{user.weekly_goal}</p>
              ) : (
                <EmptyState
                  icon={Target}
                  title="No goal set"
                  description="Set a weekly goal in Settings to stay focused."
                  action={
                    <Button asChild size="sm" variant="outline">
                      <Link to="/app/settings">Set goal</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tasks + Skills + Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Your next actions to stay on track</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="All caught up"
                  description="No pending tasks. Generate a roadmap or analyze your resume to get started."
                  action={
                    <Button asChild size="sm">
                      <Link to="/app/roadmap">Generate roadmap</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {upcomingTasks.map((task, i) => (
                    <motion.li
                      key={task.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.04 }}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-3 transition hover:border-primary/30',
                        task.done && 'opacity-60',
                      )}
                    >
                      {task.done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm font-medium', task.done && 'line-through')}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">Due {task.due}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle>Recommended Skills</CardTitle>
              <CardDescription>Close gaps for {user.career_path || 'your target role'}</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendedSkills.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No recommendations yet"
                  description="Run a skill gap analysis to get personalized recommendations."
                  action={
                    <Button asChild size="sm" variant="outline">
                      <Link to="/app/skills">Analyze skills</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recommendedSkills.map((skill, i) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.24 + i * 0.03 }}
                    >
                      <Badge variant="secondary">{skill}</Badge>
                    </motion.div>
                  ))}
                </div>
              )}
              {user.skills && user.skills.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Your skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.slice(0, 8).map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                    {user.skills.length > 8 && (
                      <Badge variant="outline">+{user.skills.length - 8} more</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly activity chart + Badges */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>
                    {totalWeeklyHours > 0
                      ? `${totalWeeklyHours.toFixed(1)} hours this week`
                      : 'Start learning to see your activity'}
                  </CardDescription>
                </div>
                <Badge variant="accent">{totalWeeklyHours.toFixed(1)}h total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${value ?? 0}h`, 'Hours']}
                    />
                    <Bar
                      dataKey="hours"
                      fill="url(#barGradient)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={48}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <Card className="glass h-full border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                Achievements
              </CardTitle>
              <CardDescription>Badges you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No badges yet"
                  description="Complete tasks and improve your resume to unlock achievements."
                />
              ) : (
                <div className="grid gap-3">
                  {badges.map((badge, i) => {
                    const meta = BADGE_META[badge] ?? {
                      label: badge.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                      icon: Trophy,
                    }
                    const Icon = meta.icon
                    return (
                      <motion.div
                        key={badge}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-gradient-to-r from-secondary/10 to-primary/5 px-4 py-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">Unlocked</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
