import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket,
  Loader2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Clock,
  Layers,
  GitBranch,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea, Badge } from '@/components/ui/input'
import { projectApi } from '@/lib/api'
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

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const

interface Project {
  title: string
  problem_statement: string
  features: string[]
  tech_stack: string[]
  architecture: string
  timeline_weeks: number
  difficulty: string
  learning_outcomes?: string[]
  github_tips: string[]
  milestones: string[]
  stretch_goals: string[]
}

function difficultyVariant(d: string) {
  if (d === 'beginner') return 'success' as const
  if (d === 'advanced') return 'warning' as const
  return 'secondary' as const
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [careerPath, setCareerPath] = useState(user?.career_path || 'Full Stack Developer')
  const [skillLevel, setSkillLevel] = useState<(typeof SKILL_LEVELS)[number]>('intermediate')
  const [interests, setInterests] = useState('')
  const [count, setCount] = useState(3)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(0)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await projectApi.generate({
        career_path: careerPath,
        skill_level: skillLevel,
        interests: interests || undefined,
        count,
      })
      setProjects(data.projects || [])
      setExpanded(0)
      toast.success(`Generated ${data.projects?.length || 0} portfolio projects`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to generate projects'
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Project Generator</h1>
            <p className="mt-1 text-muted-foreground">
              AI-crafted portfolio projects with architecture, timelines, and GitHub tips.
            </p>
          </div>
        </div>
      </motion.div>

      <Card className="border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Configure your projects
          </CardTitle>
          <CardDescription>Tailored to your career path and skill level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="career-path">Career path</Label>
              <select
                id="career-path"
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
            <div className="space-y-2">
              <Label>Skill level</Label>
              <div className="flex flex-wrap gap-2">
                {SKILL_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSkillLevel(level)}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-medium capitalize transition',
                      skillLevel === level
                        ? 'border-primary/50 bg-primary/15 text-primary'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interests">Interests (optional)</Label>
              <Textarea
                id="interests"
                placeholder="e.g. fintech, real-time apps, open source..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of projects</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={5}
                value={count}
                onChange={(e) => setCount(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
              />
            </div>
          </div>
          <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Generate projects
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4"
        >
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={generate}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-5 lg:grid-cols-2"
          >
            {projects.map((project, i) => (
              <motion.div
                key={`${project.title}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full overflow-hidden border-border/80 bg-card/70 transition hover:border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-snug">{project.title}</CardTitle>
                      <Badge variant={difficultyVariant(project.difficulty)}>
                        {project.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="leading-relaxed">
                      {project.problem_statement}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Layers className="h-3.5 w-3.5" />
                        Tech stack
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack?.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        {project.timeline_weeks} weeks
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-secondary" />
                        {project.milestones?.length || 0} milestones
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium transition hover:bg-muted/50"
                    >
                      View full details
                      {expanded === i ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expanded === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                              Architecture
                            </p>
                            <p className="text-sm leading-relaxed">{project.architecture}</p>
                          </div>
                          <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                              Features
                            </p>
                            <ul className="space-y-1">
                              {project.features?.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-sm">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                              <GitBranch className="h-3.5 w-3.5" />
                              GitHub tips
                            </p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {project.github_tips?.map((tip) => (
                                <li key={tip}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-muted/20 p-3">
                              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                                Milestones
                              </p>
                              <ol className="space-y-1 text-sm">
                                {project.milestones?.map((m, idx) => (
                                  <li key={m}>
                                    {idx + 1}. {m}
                                  </li>
                                ))}
                              </ol>
                            </div>
                            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                              <p className="mb-2 text-xs font-semibold uppercase text-accent">
                                Stretch goals
                              </p>
                              <ul className="space-y-1 text-sm">
                                {project.stretch_goals?.map((g) => (
                                  <li key={g}>✦ {g}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && projects.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Rocket className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure options above and generate portfolio-ready project ideas.
          </p>
        </div>
      )}
    </div>
  )
}
