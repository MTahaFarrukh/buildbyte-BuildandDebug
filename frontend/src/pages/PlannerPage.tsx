import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Flame,
  Flag,
  Target,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea, Badge } from '@/components/ui/input'
import { plannerApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const CAREER_PATHS = [
  'AI Engineer',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Cybersecurity Analyst',
  'DevOps Engineer',
  'Mobile Developer',
  'Product Manager',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'UI/UX Designer',
]

interface DailyTask {
  day: string
  tasks: { title: string; duration_minutes: number; type: string }[]
  total_minutes: number
}

interface PlannerData {
  goal: string
  daily_tasks: DailyTask[]
  weekly_tasks: { week: number; theme: string; tasks: string[]; milestone: string }[]
  monthly_goals: { month: number; goals: string[]; success_metrics: string[] }[]
  motivation_tips: string[]
  accountability_checkpoints: string[]
  adaptation_notes?: string
}

const TASK_TYPE_COLORS: Record<string, string> = {
  study: 'bg-primary/15 text-primary border-primary/20',
  practice: 'bg-secondary/15 text-secondary border-secondary/20',
  project: 'bg-accent/15 text-accent border-accent/20',
  review: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

export default function PlannerPage() {
  const { user } = useAuth()
  const [goal, setGoal] = useState(user?.weekly_goal || 'Land my first tech internship')
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [careerPath, setCareerPath] = useState(user?.career_path || 'Full Stack Developer')
  const [plan, setPlan] = useState<PlannerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPlan = async () => {
    if (!goal.trim()) {
      toast.error('Please enter a learning goal')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await plannerApi.create({
        goal,
        hours_per_day: hoursPerDay,
        career_path: careerPath,
        current_skills: user?.skills,
      })
      setPlan(data as PlannerData)
      toast.success('Learning plan created!')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create plan'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Learning Planner</h1>
            <p className="mt-1 text-muted-foreground">
              Daily tasks, weekly themes, monthly goals, and accountability checkpoints.
            </p>
          </div>
        </div>
      </motion.div>

      <Card className="border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle className="text-base">Plan configuration</CardTitle>
          <CardDescription>Set your goal and available study time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal">Learning goal</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What do you want to achieve?"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours per day</Label>
              <Input
                id="hours"
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value) || 2)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">Career path</Label>
              <select
                id="path"
                value={careerPath}
                onChange={(e) => setCareerPath(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              >
                {CAREER_PATHS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={createPlan} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating plan...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Create learning plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={createPlan}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {plan.adaptation_notes && (
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4 text-sm">{plan.adaptation_notes}</CardContent>
            </Card>
          )}

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-primary" />
              Daily tasks
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plan.daily_tasks.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full border-border/80 bg-card/70">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{day.day}</CardTitle>
                      <CardDescription>{Math.round(day.total_minutes / 60 * 10) / 10}h total</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {day.tasks.map((task) => (
                        <div
                          key={task.title}
                          className="rounded-lg border border-border bg-muted/20 p-2.5"
                        >
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge
                              className={cn(
                                'border',
                                TASK_TYPE_COLORS[task.type] || 'bg-muted text-foreground',
                              )}
                            >
                              {task.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {task.duration_minutes} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/80 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckSquare className="h-4 w-4 text-secondary" />
                  Weekly tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.weekly_tasks.map((week) => (
                  <div key={week.week} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Week {week.week}</span>
                      <Badge variant="secondary">{week.theme}</Badge>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {week.tasks.map((t) => (
                        <li key={t} className="flex gap-2 text-muted-foreground">
                          <span className="text-primary">•</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent">
                      <Flag className="h-3.5 w-3.5" />
                      Milestone: {week.milestone}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  Monthly goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.monthly_goals.map((month) => (
                  <div key={month.month} className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="font-semibold">Month {month.month}</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {month.goals.map((g) => (
                        <li key={g} className="text-muted-foreground">
                          → {g}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Success metrics
                      </p>
                      <ul className="mt-1 space-y-1 text-sm">
                        {month.success_metrics.map((m) => (
                          <li key={m}>✓ {m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border-border/80 bg-gradient-to-br from-primary/10 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flame className="h-4 w-4 text-orange-400" />
                  Motivation tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {plan.motivation_tips.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="text-primary">★</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/70">
              <CardHeader>
                <CardTitle className="text-base">Accountability checkpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plan.accountability_checkpoints.map((cp) => (
                    <div
                      key={cp}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      {cp}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {!loading && !plan && !error && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 font-medium">Build your learning schedule</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Set a goal and daily hours to generate a personalized plan.
          </p>
        </div>
      )}
    </div>
  )
}
