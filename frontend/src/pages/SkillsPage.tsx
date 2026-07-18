import { useState, useCallback, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Badge } from '@/components/ui/input'
import { Progress, ProgressCircle } from '@/components/ui/progress'
import { skillsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface MissingSkill {
  skill: string
  priority: number
  difficulty: string
  estimated_hours: number
  estimated_weeks?: number
  why_important?: string
  resources?: string[]
}

interface SkillAnalysis {
  target_role: string
  current_skills: { skill: string; level?: string; relevance?: string }[]
  missing_skills: MissingSkill[]
  overall_readiness: number
  estimated_time_to_ready_weeks?: number
  priority_learning_order: string[]
  summary?: string
}

function difficultyColor(d: string) {
  if (d === 'hard') return 'warning'
  if (d === 'easy') return 'success'
  return 'secondary'
}

export default function SkillsPage() {
  const { user } = useAuth()
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(user?.skills || [])
  const [targetRole, setTargetRole] = useState(user?.career_path || 'Software Engineer')
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null)
  const [checkedSkills, setCheckedSkills] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addSkill = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return
      const parts = trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      setSkills((prev) => {
        const next = [...prev]
        parts.forEach((p) => {
          if (!next.some((s) => s.toLowerCase() === p.toLowerCase())) next.push(p)
        })
        return next
      })
      setSkillInput('')
    },
    [],
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(skillInput)
    }
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const toggleChecked = (skill: string) => {
    setCheckedSkills((prev) => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      return next
    })
  }

  const analyze = async () => {
    if (skills.length === 0) {
      toast.error('Add at least one current skill')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await skillsApi.analyze({
        current_skills: skills,
        target_role: targetRole,
      })
      setAnalysis(data as SkillAnalysis)
      setCheckedSkills(new Set())
      toast.success('Skill gap analysis complete')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Analysis failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const progressPct =
    analysis && analysis.missing_skills.length > 0
      ? Math.round((checkedSkills.size / analysis.missing_skills.length) * 100)
      : 0

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 text-accent">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Skill Gap Analysis</h1>
            <p className="mt-1 text-muted-foreground">
              Discover missing skills, priority order, and track your learning progress.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/80 bg-card/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Your skills</CardTitle>
            <CardDescription>Type skills and press Enter or comma to add tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skills">Current skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="Python, React, Git..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => skillInput && addSkill(skillInput)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addSkill(skillInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex min-h-[40px] flex-wrap gap-2 pt-1">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-0.5 rounded p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-muted-foreground">No skills added yet</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-role">Target role</Label>
              <Input
                id="target-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
              />
            </div>
            <Button onClick={analyze} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Analyze skill gap
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Card className="border-border/80 bg-card/70">
              <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
                <ProgressCircle
                  value={analysis.overall_readiness}
                  label="Readiness"
                  size={140}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg font-semibold">{analysis.target_role}</h2>
                  {analysis.summary && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {analysis.summary}
                    </p>
                  )}
                  {analysis.estimated_time_to_ready_weeks && (
                    <p className="mt-3 flex items-center justify-center gap-2 text-sm sm:justify-start">
                      <Clock className="h-4 w-4 text-primary" />
                      ~{analysis.estimated_time_to_ready_weeks} weeks to job-ready
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={analyze}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <Card className="border-border/80 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">Current skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.current_skills.map((s) => (
                <div
                  key={s.skill}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-2.5"
                >
                  <span className="text-sm font-medium">{s.skill}</span>
                  <div className="flex gap-2">
                    {s.level && <Badge variant="outline">{s.level}</Badge>}
                    {s.relevance && <Badge variant="success">{s.relevance}</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Priority learning order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {analysis.priority_learning_order.map((skill, i) => (
                  <li
                    key={skill}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    {skill}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/70 lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Missing skills & progress tracker</CardTitle>
                  <CardDescription>
                    Check off skills as you complete them ({checkedSkills.size}/
                    {analysis.missing_skills.length})
                  </CardDescription>
                </div>
                <div className="w-full max-w-[200px]">
                  <Progress value={progressPct} />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{progressPct}% complete</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.missing_skills.map((skill) => (
                <button
                  key={skill.skill}
                  type="button"
                  onClick={() => toggleChecked(skill.skill)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition',
                    checkedSkills.has(skill.skill)
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border bg-muted/20 hover:bg-muted/40',
                  )}
                >
                  {checkedSkills.has(skill.skill) ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'font-medium',
                          checkedSkills.has(skill.skill) && 'text-muted-foreground line-through',
                        )}
                      >
                        {skill.skill}
                      </span>
                      <Badge variant="default">P{skill.priority}</Badge>
                      <Badge variant={difficultyColor(skill.difficulty)}>{skill.difficulty}</Badge>
                      <Badge variant="outline">{skill.estimated_hours}h</Badge>
                    </div>
                    {skill.why_important && (
                      <p className="text-sm text-muted-foreground">{skill.why_important}</p>
                    )}
                    {skill.resources && skill.resources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skill.resources.map((r) => (
                          <Badge key={r} variant="outline">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!loading && !analysis && !error && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Target className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 font-medium">Map your skill gaps</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your current skills and target role to get a personalized analysis.
          </p>
        </div>
      )}
    </div>
  )
}
