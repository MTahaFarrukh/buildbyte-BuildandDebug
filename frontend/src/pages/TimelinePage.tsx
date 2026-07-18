import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, Trophy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecommendationBanner } from '@/components/RecommendationBanner'
import { Button } from '@/components/ui/button'
import { useWorkspace } from '@/store/workspace'
import { cn } from '@/lib/utils'

const TYPE_COLOR: Record<string, string> = {
  resume: 'bg-indigo-500',
  resume_analysis: 'bg-violet-500',
  resume_rewrite: 'bg-purple-500',
  roadmap: 'bg-cyan-500',
  task: 'bg-emerald-500',
  projects: 'bg-amber-500',
  project_done: 'bg-orange-500',
  interview: 'bg-rose-500',
  job_match: 'bg-sky-500',
  achievement: 'bg-yellow-400',
  pdf: 'bg-slate-400',
  skill_gap: 'bg-teal-500',
}

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

export default function TimelinePage() {
  const timeline = useWorkspace((s) => s.timeline)
  const scoreHistory = useWorkspace((s) => s.scoreHistory)

  const byDay = useMemo(() => {
    const map = new Map<string, typeof timeline>()
    timeline.forEach((e) => {
      const k = dayKey(e.at)
      const arr = map.get(k) || []
      arr.push(e)
      map.set(k, arr)
    })
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [timeline])

  // Last 12 weeks contribution-style intensity
  const weeks = useMemo(() => {
    const days: { date: string; count: number }[] = []
    const now = new Date()
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const count = timeline.filter((e) => dayKey(e.at) === key).length
      days.push({ date: key, count })
    }
    return days
  }, [timeline])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <History className="h-8 w-8 text-primary" /> Career Timeline
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your journey across resumes, roadmaps, projects, and interviews.
        </p>
      </motion.div>

      <RecommendationBanner />

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Activity heatmap</CardTitle>
          <CardDescription>Last ~12 weeks — like a contribution graph</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {weeks.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} events`}
                className={cn(
                  'h-3 w-3 rounded-sm',
                  d.count === 0 && 'bg-muted',
                  d.count === 1 && 'bg-primary/40',
                  d.count === 2 && 'bg-primary/70',
                  d.count >= 3 && 'bg-primary',
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {scoreHistory.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Career Score changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scoreHistory.slice(0, 8).map((h) => (
              <div
                key={h.at}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(h.at).toLocaleString()}
                </span>
                <span className="font-bold tabular-nums">{h.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!timeline.length ? (
        <Card className="glass">
          <CardContent className="space-y-4 p-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No journey events yet</p>
            <p className="text-sm text-muted-foreground">
              Upload a resume, generate a roadmap, or complete a task — milestones appear here.
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild size="sm">
                <Link to="/app/resume">Upload Resume</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/app/roadmap">Create Roadmap</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {byDay.map(([day, events]) => (
            <div key={day}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {new Date(day + 'T12:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <div className="relative space-y-3 border-l-2 border-border pl-6">
                {events.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    <span
                      className={cn(
                        'absolute -left-[1.7rem] top-2 h-3 w-3 rounded-full ring-4 ring-background',
                        TYPE_COLOR[e.type] || 'bg-primary',
                      )}
                    />
                    <Card className="glass">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{e.title}</p>
                            {e.detail && (
                              <p className="mt-0.5 text-sm text-muted-foreground">{e.detail}</p>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(e.at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
