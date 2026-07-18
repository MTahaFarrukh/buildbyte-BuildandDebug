import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { bonusApi } from '@/lib/api'
import { useWorkspace } from '@/store/workspace'
import { RecommendationBanner } from '@/components/RecommendationBanner'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

export default function AnalyticsPage() {
  const ws = useWorkspace()
  const a = ws.getAnalytics()
  const [insights, setInsights] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const loadInsights = async () => {
    setLoading(true)
    try {
      const activity = JSON.stringify({
        roadmapProgress: a.roadmapProgress,
        hours: a.hoursStudied,
        completedSkills: a.completedSkills,
        interviewReadiness: a.interviewReadiness,
        resumeScore: ws.resumeScore,
      })
      const { data } = await bonusApi.insights({
        activity_data: activity,
        career_path: ws.careerPath,
        career_score: ws.getCareerScore(),
      })
      setInsights(data)
      toast.success('Weekly insights ready')
    } catch {
      toast.error('Could not load insights')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Charts computed from your real workspace progress (roadmap, resume, hours, AI usage).
        </p>
      </motion.div>

      <RecommendationBanner />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Weekly completion', value: `${a.weeklyCompletion}%` },
          { label: 'Monthly completion', value: `${a.monthlyCompletion}%` },
          { label: 'Roadmap progress', value: `${a.roadmapProgress}%` },
          { label: 'AI usage events', value: String(a.aiUsage) },
        ].map((s) => (
          <Card key={s.label} className="glass">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Hours studied</p>
            <p className="mt-2 text-2xl font-bold">{a.hoursStudied}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Completed skills/tasks</p>
            <p className="mt-2 text-2xl font-bold">{a.completedSkills}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Interview readiness</p>
            <p className="mt-2 text-2xl font-bold">{a.interviewReadiness}</p>
            <Progress value={a.interviewReadiness} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Career score trend</CardTitle>
            <CardDescription>Derived from resume, ATS, match, roadmap, interview</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={a.careerProgress}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Learning hours</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.learningHoursMonthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="hours" stroke="#06B6D4" fill="#06B6D433" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Skills / tasks completed</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.skillsCompletedMonthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Resume score journey</CardTitle>
            <CardDescription>Improvement delta: +{a.resumeImprovement}</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={a.resumeScores}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" /> Weekly AI insights
              </CardTitle>
              <CardDescription>Generated from your real activity snapshot</CardDescription>
            </div>
            <Button onClick={loadInsights} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate insights
            </Button>
          </div>
        </CardHeader>
        {insights && (
          <CardContent className="space-y-3 text-sm">
            <p>{String(insights.week_summary || '')}</p>
            <div className="flex flex-wrap gap-2">
              {((insights.wins as string[]) || []).map((w) => (
                <Badge key={w} variant="success">
                  {w}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground">{String(insights.motivation_message || '')}</p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
