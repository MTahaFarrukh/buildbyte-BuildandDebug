import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Loader2,
  Map,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Wrench,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input, Textarea, Label, Badge } from '@/components/ui/input'
import { EmptyState, Skeleton } from '@/components/ui/progress'
import { roadmapApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
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
  { value: 'beginner', label: 'Beginner', desc: 'New to the field' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some projects & coursework' },
  { value: 'advanced', label: 'Advanced', desc: 'Job-ready, refining depth' },
]

type TabId =
  | 'overview'
  | 'monthly'
  | 'weekly'
  | 'skills'
  | 'projects'
  | 'courses'
  | 'books'
  | 'certifications'
  | 'resources'

interface RoadmapData {
  career_path: string
  duration_months?: number
  overview?: string
  skill_levels?: Record<string, string[]>
  weekly_timeline?: {
    week: number
    focus: string
    tasks: string[]
    hours?: number
  }[]
  monthly_timeline?: {
    month: number
    theme: string
    milestones: string[]
    skills_to_master: string[]
  }[]
  projects?: {
    title: string
    difficulty: string
    description: string
    tech_stack: string[]
  }[]
  courses?: {
    title: string
    provider: string
    url_hint?: string
    free?: boolean
  }[]
  books?: { title: string; author: string; why: string }[]
  certifications?: { name: string; provider: string; priority: string }[]
  practice_resources?: { name: string; type: string; description: string }[]
}

const TABS: { id: TabId; label: string; icon: typeof Map }[] = [
  { id: 'overview', label: 'Overview', icon: Map },
  { id: 'monthly', label: 'Monthly', icon: Calendar },
  { id: 'weekly', label: 'Weekly', icon: Clock },
  { id: 'skills', label: 'Skills', icon: Target },
  { id: 'projects', label: 'Projects', icon: Rocket },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'certifications', label: 'Certs', icon: Trophy },
  { id: 'resources', label: 'Practice', icon: Wrench },
]

const DIFFICULTY_VARIANT: Record<string, 'default' | 'secondary' | 'accent'> = {
  beginner: 'accent',
  intermediate: 'default',
  advanced: 'secondary',
}

export default function RoadmapPage() {
  const { user } = useAuth()

  const [paths, setPaths] = useState<string[]>(DEFAULT_PATHS)
  const [careerPath, setCareerPath] = useState(user?.career_path || 'Full Stack Developer')
  const [level, setLevel] = useState('beginner')
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [background, setBackground] = useState('')

  const [loadingPaths, setLoadingPaths] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    roadmapApi
      .paths()
      .then(({ data }) => {
        if (data.paths?.length) setPaths(data.paths)
      })
      .catch(() => {
        /* use defaults */
      })
      .finally(() => setLoadingPaths(false))
  }, [])

  const handleGenerate = async () => {
    if (!careerPath.trim()) {
      toast.error('Select a career path')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const { data } = await roadmapApi.generate({
        career_path: careerPath,
        current_level: level,
        background: background || 'Student / early career',
        hours_per_week: hoursPerWeek,
      })
      setRoadmap({
        career_path: data.career_path ?? careerPath,
        duration_months: data.duration_months,
        overview: data.overview,
        skill_levels: data.skill_levels,
        weekly_timeline: data.weekly_timeline,
        monthly_timeline: data.monthly_timeline,
        projects: data.projects,
        courses: data.courses,
        books: data.books,
        certifications: data.certifications,
        practice_resources: data.practice_resources,
      })
      setActiveTab('overview')
      toast.success('Roadmap generated')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (e instanceof Error ? e.message : 'Generation failed')
      setError(msg)
      toast.error(msg)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Career Roadmap</h1>
        <p className="mt-1 text-muted-foreground">
          AI-generated learning path tailored to your goals and schedule
        </p>
      </motion.div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* Generator form */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Configure Your Path
          </CardTitle>
          <CardDescription>Select career path, level, and weekly commitment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Career Path</Label>
            {loadingPaths ? (
              <Skeleton className="h-11 w-full" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {paths.map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setCareerPath(path)}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-left text-sm transition',
                      careerPath === path
                        ? 'border-primary bg-primary/10 font-medium text-primary shadow-sm'
                        : 'border-border bg-muted/20 hover:border-primary/40',
                    )}
                  >
                    {path}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Current Level</Label>
              <div className="grid gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLevel(l.value)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                      level === l.value
                        ? 'border-secondary bg-secondary/10'
                        : 'border-border hover:border-secondary/40',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{l.label}</p>
                      <p className="text-xs text-muted-foreground">{l.desc}</p>
                    </div>
                    {level === l.value && <ChevronRight className="h-4 w-4 text-secondary" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours per Week</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={60}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value) || 10)}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 8–15 hrs for students, 5–10 for working professionals
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">Background (optional)</Label>
                <Textarea
                  id="background"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="CS student, career switcher from finance, self-taught…"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <Button size="lg" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Map className="h-4 w-4" />
            )}
            Generate Roadmap
          </Button>
        </CardContent>
      </Card>

      {generating && !roadmap && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!generating && !roadmap && (
        <EmptyState
          icon={Map}
          title="No roadmap yet"
          description="Choose your career path and click Generate to get a personalized month-by-month plan."
        />
      )}

      <AnimatePresence>
        {roadmap && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Tab navigation */}
            <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card/60 p-2 backdrop-blur-sm">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>{roadmap.career_path} Roadmap</CardTitle>
                      <CardDescription>
                        {roadmap.duration_months
                          ? `${roadmap.duration_months}-month plan · ${hoursPerWeek} hrs/week`
                          : `Personalized plan · ${hoursPerWeek} hrs/week`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {roadmap.overview ||
                          `A structured path from ${level} to job-ready ${roadmap.career_path}.`}
                      </p>
                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {[
                          {
                            label: 'Months',
                            value: roadmap.duration_months ?? roadmap.monthly_timeline?.length ?? '—',
                          },
                          {
                            label: 'Projects',
                            value: roadmap.projects?.length ?? 0,
                          },
                          {
                            label: 'Courses',
                            value: roadmap.courses?.length ?? 0,
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-xl border border-border bg-muted/30 p-4 text-center"
                          >
                            <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'monthly' && (
                  <div className="space-y-4">
                    {(roadmap.monthly_timeline ?? []).length === 0 ? (
                      <EmptyState
                        icon={Calendar}
                        title="No monthly timeline"
                        description="Regenerate the roadmap to get month-by-month milestones."
                      />
                    ) : (
                      roadmap.monthly_timeline!.map((month, i) => (
                        <motion.div
                          key={month.month}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card className="glass overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-sm font-bold text-primary">
                                  M{month.month}
                                </div>
                                <div>
                                  <CardTitle className="text-base">{month.theme}</CardTitle>
                                  <CardDescription>Month {month.month}</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Milestones
                                </p>
                                <ul className="space-y-1.5">
                                  {month.milestones.map((m) => (
                                    <li key={m} className="flex gap-2 text-sm">
                                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                      {m}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Skills to Master
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {month.skills_to_master.map((s) => (
                                    <Badge key={s} variant="secondary">
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'weekly' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(roadmap.weekly_timeline ?? []).length === 0 ? (
                      <div className="sm:col-span-2">
                        <EmptyState
                          icon={Clock}
                          title="No weekly breakdown"
                          description="Weekly tasks will appear after generation."
                        />
                      </div>
                    ) : (
                      roadmap.weekly_timeline!.map((week, i) => (
                        <motion.div
                          key={week.week}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <Card className="glass h-full">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Week {week.week}</CardTitle>
                                {week.hours != null && (
                                  <Badge variant="outline">{week.hours}h</Badge>
                                )}
                              </div>
                              <CardDescription>{week.focus}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {week.tasks.map((task) => (
                                  <li key={task} className="flex gap-2 text-sm">
                                    <span className="text-primary">•</span>
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'skills' && (
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Skill Progression</CardTitle>
                      <CardDescription>Skills organized by proficiency level</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!roadmap.skill_levels ||
                      Object.keys(roadmap.skill_levels).length === 0 ? (
                        <EmptyState
                          icon={Target}
                          title="No skill breakdown"
                          description="Skill levels will be included in your generated roadmap."
                        />
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-3">
                          {Object.entries(roadmap.skill_levels).map(([tier, skills]) => (
                            <div
                              key={tier}
                              className="rounded-xl border border-border bg-muted/20 p-4"
                            >
                              <Badge
                                variant={DIFFICULTY_VARIANT[tier] ?? 'outline'}
                                className="mb-3 capitalize"
                              >
                                {tier}
                              </Badge>
                              <ul className="space-y-2">
                                {skills.map((s) => (
                                  <li key={s} className="text-sm">
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'projects' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(roadmap.projects ?? []).length === 0 ? (
                      <div className="sm:col-span-2">
                        <EmptyState
                          icon={Rocket}
                          title="No projects listed"
                          description="Portfolio projects will appear in your roadmap."
                        />
                      </div>
                    ) : (
                      roadmap.projects!.map((project, i) => (
                        <motion.div
                          key={project.title}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card className="glass h-full">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base">{project.title}</CardTitle>
                                <Badge
                                  variant={
                                    DIFFICULTY_VARIANT[project.difficulty] ?? 'outline'
                                  }
                                  className="capitalize shrink-0"
                                >
                                  {project.difficulty}
                                </Badge>
                              </div>
                              <CardDescription>{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1.5">
                                {project.tech_stack.map((t) => (
                                  <Badge key={t} variant="accent">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div className="space-y-3">
                    {(roadmap.courses ?? []).length === 0 ? (
                      <EmptyState
                        icon={GraduationCap}
                        title="No courses listed"
                        description="Course recommendations will appear after generation."
                      />
                    ) : (
                      roadmap.courses!.map((course) => (
                        <Card key={course.title} className="glass">
                          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                            <div>
                              <p className="font-semibold">{course.title}</p>
                              <p className="text-sm text-muted-foreground">{course.provider}</p>
                            </div>
                            <div className="flex gap-2">
                              {course.free && <Badge variant="success">Free</Badge>}
                              {course.url_hint && (
                                <Badge variant="outline">{course.url_hint}</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'books' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(roadmap.books ?? []).length === 0 ? (
                      <div className="sm:col-span-2">
                        <EmptyState
                          icon={BookOpen}
                          title="No book recommendations"
                          description="Reading list will be included in your roadmap."
                        />
                      </div>
                    ) : (
                      roadmap.books!.map((book) => (
                        <Card key={book.title} className="glass">
                          <CardHeader>
                            <CardTitle className="text-base">{book.title}</CardTitle>
                            <CardDescription>by {book.author}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{book.why}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'certifications' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(roadmap.certifications ?? []).length === 0 ? (
                      <div className="sm:col-span-2">
                        <EmptyState
                          icon={Trophy}
                          title="No certifications listed"
                          description="Certification suggestions will appear after generation."
                        />
                      </div>
                    ) : (
                      roadmap.certifications!.map((cert) => (
                        <Card key={cert.name} className="glass">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold">{cert.name}</p>
                                <p className="text-sm text-muted-foreground">{cert.provider}</p>
                              </div>
                              <Badge variant="outline" className="capitalize shrink-0">
                                {cert.priority}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(roadmap.practice_resources ?? []).length === 0 ? (
                      <div className="sm:col-span-2">
                        <EmptyState
                          icon={Wrench}
                          title="No practice resources"
                          description="Practice platforms and repos will be listed here."
                        />
                      </div>
                    ) : (
                      roadmap.practice_resources!.map((res) => (
                        <Card key={res.name} className="glass">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{res.name}</CardTitle>
                              <Badge variant="secondary">{res.type}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{res.description}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
