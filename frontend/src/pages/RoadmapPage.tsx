import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Map,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Textarea, Label, Badge } from '@/components/ui/input'
import { EmptyState, Progress, Skeleton } from '@/components/ui/progress'
import { roadmapApi } from '@/lib/api'
import { tasksFromRoadmap, useWorkspace, type TaskStatus } from '@/store/workspace'
import { RecommendationBanner } from '@/components/RecommendationBanner'
import { cn } from '@/lib/utils'

const DEFAULT_PATHS = [
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

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

function validateHours(raw: string): { ok: boolean; value: number; error: string | null } {
  if (raw.trim() === '') return { ok: false, value: 0, error: 'Please enter a valid number.' }
  if (!/^-?\d+$/.test(raw.trim())) return { ok: false, value: 0, error: 'Please enter a valid number.' }
  const n = Number(raw)
  if (!Number.isInteger(n)) return { ok: false, value: n, error: 'Please enter a valid number.' }
  if (n < 1) return { ok: false, value: n, error: 'Hours must be at least 1.' }
  if (n > 80) return { ok: false, value: n, error: 'Hours cannot exceed 80.' }
  return { ok: true, value: n, error: null }
}

export default function RoadmapPage() {
  const {
    careerPath,
    roadmap,
    roadmapTasks,
    setCareerPath,
    setRoadmap,
    setTaskStatus,
    getRoadmapProgress,
  } = useWorkspace()

  const [paths, setPaths] = useState<string[]>(DEFAULT_PATHS)
  const [path, setPath] = useState(careerPath || 'Full Stack Developer')
  const [level, setLevel] = useState('beginner')
  const [hoursRaw, setHoursRaw] = useState('10')
  const [background, setBackground] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'monthly' | 'weekly' | 'tasks'>('tasks')

  const hoursCheck = validateHours(hoursRaw)
  const progress = getRoadmapProgress()

  useEffect(() => {
    roadmapApi.paths().then((r) => {
      if (r.data?.paths?.length) setPaths(r.data.paths)
    }).catch(() => undefined)
  }, [])

  const monthly = useMemo(
    () => ((roadmap?.monthly_timeline as Array<Record<string, unknown>>) || []),
    [roadmap],
  )
  const weekly = useMemo(
    () => ((roadmap?.weekly_timeline as Array<Record<string, unknown>>) || []),
    [roadmap],
  )

  const generate = async () => {
    if (!hoursCheck.ok) {
      toast.error(hoursCheck.error || 'Invalid hours')
      return
    }
    setLoading(true)
    try {
      const { data } = await roadmapApi.generate({
        career_path: path,
        current_level: level,
        background,
        hours_per_week: hoursCheck.value,
      })
      const tasks = tasksFromRoadmap(data)
      setCareerPath(path)
      setRoadmap(data, tasks)
      setTab('tasks')
      toast.success('Roadmap generated — weeks derived from monthly topics')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate roadmap')
    } finally {
      setLoading(false)
    }
  }

  const cycleStatus = (id: string, current: TaskStatus) => {
    const order: TaskStatus[] = ['pending', 'in_progress', 'completed', 'skipped']
    const next = order[(order.indexOf(current) + 1) % order.length]
    setTaskStatus(id, next)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Career Roadmap</h1>
        <p className="mt-1 text-muted-foreground">
          Monthly topics are the source of truth — weekly plan is auto-derived 1:1.
        </p>
      </motion.div>

      <RecommendationBanner />

      <Card className="glass">
        <CardHeader>
          <CardTitle>Generate roadmap</CardTitle>
          <CardDescription>Pick a path, level, and weekly study hours (1–80).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {paths.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPath(p)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-left text-sm transition',
                  path === p ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <Button
                key={l.value}
                size="sm"
                variant={level === l.value ? 'default' : 'outline'}
                onClick={() => setLevel(l.value)}
              >
                {l.label}
              </Button>
            ))}
          </div>
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="hours">Hours per week</Label>
            <Input
              id="hours"
              type="number"
              inputMode="numeric"
              min={1}
              max={80}
              step={1}
              value={hoursRaw}
              onChange={(e) => setHoursRaw(e.target.value)}
            />
            {hoursCheck.error && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" /> {hoursCheck.error}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Background (optional)</Label>
            <Textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="min-h-[72px]"
              placeholder="Student, internships, languages…"
            />
          </div>
          <Button onClick={generate} disabled={loading || !hoursCheck.ok}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Roadmap
          </Button>
        </CardContent>
      </Card>

      {!roadmap && !loading && (
        <EmptyState
          icon={Map}
          title="No roadmap generated"
          description="Create a personalized monthly plan — completing tasks raises Career Score and unlocks achievements."
          action={
            <Button onClick={() => document.getElementById('hours')?.focus()}>
              Create Roadmap
            </Button>
          }
        />
      )}
      {loading && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32" />
          </CardContent>
        </Card>
      )}

      {roadmap && (
        <div className="space-y-4">
          <Card className="glass">
            <CardContent className="flex flex-wrap items-center gap-6 p-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Roadmap progress</p>
                <p className="text-2xl font-bold">{progress}%</p>
                <Progress value={progress} className="mt-2" />
              </div>
              <Badge variant="accent">{String(roadmap.career_path || path)}</Badge>
              <Badge variant="outline">{roadmapTasks.filter((t) => t.status === 'completed').length} done</Badge>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {(['tasks', 'monthly', 'weekly'] as const).map((t) => (
              <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}>
                {t === 'tasks' ? 'Progress tracker' : t === 'monthly' ? 'Monthly' : 'Weekly (derived)'}
              </Button>
            ))}
          </div>

          {tab === 'tasks' && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Interactive tasks
                </CardTitle>
                <CardDescription>Click a task to cycle Pending → In progress → Completed → Skipped</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {roadmapTasks.map((task) => {
                  const glyph =
                    task.status === 'completed' ? '☑' : task.status === 'in_progress' ? '◐' : '☐'
                  return (
                    <motion.button
                      key={task.id}
                      type="button"
                      layout
                      onClick={() => cycleStatus(task.id, task.status)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition',
                        task.status === 'completed'
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : task.status === 'in_progress'
                            ? 'border-accent/40 bg-accent/10'
                            : 'border-border bg-muted/20 hover:bg-muted/40',
                      )}
                      whileTap={{ scale: 0.98 }}
                      animate={
                        task.status === 'completed'
                          ? { scale: [1, 1.02, 1] }
                          : { scale: 1 }
                      }
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base font-bold',
                          task.status === 'completed' && 'text-emerald-400',
                          task.status === 'in_progress' && 'text-accent',
                        )}
                        aria-hidden
                      >
                        {glyph}
                      </span>
                      <span
                        className={cn(
                          'flex-1 font-medium',
                          task.status === 'completed' && 'line-through opacity-80',
                        )}
                      >
                        {task.title}
                      </span>
                      <Badge variant="outline">
                        M{task.month} · W{task.week}
                      </Badge>
                      <Badge
                        variant={
                          task.status === 'completed'
                            ? 'success'
                            : task.status === 'in_progress'
                              ? 'accent'
                              : 'outline'
                        }
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </motion.button>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {tab === 'monthly' && (
            <div className="space-y-3">
              {monthly.map((m) => (
                <Card key={String(m.month)} className="glass">
                  <CardHeader>
                    <CardTitle>
                      Month {String(m.month)} — {String(m.theme || '')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {((m.topics as string[]) || (m.skills_to_master as string[]) || []).map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tab === 'weekly' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Derived from monthly topics — not generated separately.
              </p>
              {weekly.map((w) => (
                <Card key={String(w.week)} className="glass">
                  <CardContent className="flex items-center gap-3 p-4">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">
                        Week {String(w.week)} — {String(w.focus)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((w.tasks as string[]) || []).join(' · ')}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {String(w.hours || '—')}h
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
