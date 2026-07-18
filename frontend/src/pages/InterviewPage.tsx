import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Loader2,
  RefreshCw,
  AlertCircle,
  Code2,
  Users,
  Building2,
  Brain,
  Network,
  Mic,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea, Badge } from '@/components/ui/input'
import { interviewApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry / Intern' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
]

type TabKey =
  | 'technical'
  | 'behavioral'
  | 'hr'
  | 'coding'
  | 'system_design'
  | 'mock_interview'

const TABS: { key: TabKey; label: string; icon: typeof Code2 }[] = [
  { key: 'technical', label: 'Technical', icon: Brain },
  { key: 'behavioral', label: 'Behavioral', icon: Users },
  { key: 'hr', label: 'HR', icon: Building2 },
  { key: 'coding', label: 'Coding', icon: Code2 },
  { key: 'system_design', label: 'System Design', icon: Network },
  { key: 'mock_interview', label: 'Mock Interview', icon: Mic },
]

interface InterviewData {
  role: string
  technical_questions?: Record<string, unknown>[]
  behavioral_questions?: Record<string, unknown>[]
  hr_questions?: Record<string, unknown>[]
  coding_questions?: Record<string, unknown>[]
  system_design_questions?: Record<string, unknown>[]
  mock_interview?: Record<string, unknown>
}

function QACard({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-medium">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {open ? (
          <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border px-4 py-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function InterviewPage() {
  const { user } = useAuth()
  const [role, setRole] = useState(user?.career_path || 'Software Engineer')
  const [experienceLevel, setExperienceLevel] = useState('entry')
  const [focusAreas, setFocusAreas] = useState('')
  const [data, setData] = useState<InterviewData | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('technical')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await interviewApi.generate({
        role,
        experience_level: experienceLevel,
        focus_areas: focusAreas || 'general',
      })
      setData(res as InterviewData)
      toast.success('Interview prep pack ready!')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to generate interview prep'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    if (!data) return null

    switch (activeTab) {
      case 'technical':
        return (
          <div className="space-y-3">
            {(data.technical_questions || []).map((q, i) => (
              <QACard
                key={i}
                title={String(q.question || 'Question')}
                subtitle={q.difficulty ? `Difficulty: ${String(q.difficulty)}` : undefined}
              >
                <div className="space-y-3 text-sm">
                  {Array.isArray(q.hints) && q.hints.length > 0 && (
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Hints
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        {(q.hints as string[]).map((h) => (
                          <li key={h}>• {h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {q.sample_answer_outline ? (
                    <div className="rounded-lg bg-primary/5 p-3">
                      <p className="text-xs font-semibold uppercase text-primary">Answer outline</p>
                      <p className="mt-1">{String(q.sample_answer_outline)}</p>
                    </div>
                  ) : null}
                </div>
              </QACard>
            ))}
          </div>
        )
      case 'behavioral':
        return (
          <div className="space-y-3">
            {(data.behavioral_questions || []).map((q, i) => (
              <QACard key={i} title={String(q.question || 'Question')}>
                <div className="space-y-2 text-sm">
                  {q.star_framework_tips ? (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">STAR tips: </span>
                      {String(q.star_framework_tips)}
                    </p>
                  ) : null}
                  {Array.isArray(q.sample_points) && (
                    <ul className="space-y-1">
                      {(q.sample_points as string[]).map((p) => (
                        <li key={p} className="flex gap-2">
                          <span className="text-primary">→</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </QACard>
            ))}
          </div>
        )
      case 'hr':
        return (
          <div className="space-y-3">
            {(data.hr_questions || []).map((q, i) => (
              <QACard key={i} title={String(q.question || 'Question')}>
                <div className="space-y-2 text-sm">
                  {q.what_they_look_for ? (
                    <p>
                      <span className="font-medium">What they look for: </span>
                      <span className="text-muted-foreground">{String(q.what_they_look_for)}</span>
                    </p>
                  ) : null}
                  {q.tips ? (
                    <p className="rounded-lg bg-accent/5 p-3 text-accent">
                      Tip: {String(q.tips)}
                    </p>
                  ) : null}
                </div>
              </QACard>
            ))}
          </div>
        )
      case 'coding':
        return (
          <div className="space-y-3">
            {(data.coding_questions || []).map((q, i) => (
              <QACard
                key={i}
                title={String(q.title || 'Coding problem')}
                subtitle={q.difficulty ? String(q.difficulty) : undefined}
              >
                <div className="space-y-2 text-sm">
                  {q.problem ? <p>{String(q.problem)}</p> : null}
                  {q.approach ? (
                    <p>
                      <span className="font-medium">Approach: </span>
                      {String(q.approach)}
                    </p>
                  ) : null}
                  {q.complexity ? (
                    <Badge variant="secondary">{String(q.complexity)}</Badge>
                  ) : null}
                </div>
              </QACard>
            ))}
          </div>
        )
      case 'system_design':
        return (
          <div className="space-y-3">
            {(data.system_design_questions || []).map((q, i) => (
              <QACard key={i} title={String(q.question || 'Design question')}>
                <div className="space-y-3 text-sm">
                  {Array.isArray(q.key_components) && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                        Key components
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(q.key_components as string[]).map((c) => (
                          <Badge key={c}>{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {Array.isArray(q.discussion_points) && (
                    <ul className="space-y-1 text-muted-foreground">
                      {(q.discussion_points as string[]).map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </QACard>
            ))}
          </div>
        )
      case 'mock_interview': {
        const mock = data.mock_interview || {}
        return (
          <div className="space-y-4">
            {mock.opening ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-sm">{String(mock.opening)}</CardContent>
              </Card>
            ) : null}
            {Array.isArray(mock.questions_sequence) && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Question sequence
                </p>
                <ol className="space-y-2">
                  {(mock.questions_sequence as string[]).map((q, i) => (
                    <li
                      key={q}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      {q}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {Array.isArray(mock.evaluation_criteria) && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Evaluation criteria
                </p>
                <div className="flex flex-wrap gap-2">
                  {(mock.evaluation_criteria as string[]).map((c) => (
                    <Badge key={c} variant="accent">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {mock.closing_advice ? (
              <p className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
                {String(mock.closing_advice)}
              </p>
            ) : null}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 text-secondary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Interview Prep</h1>
            <p className="mt-1 text-muted-foreground">
              Technical, behavioral, HR, coding, system design, and mock interview practice.
            </p>
          </div>
        </div>
      </motion.div>

      <Card className="border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle className="text-base">Target role setup</CardTitle>
          <CardDescription>Customize your interview preparation pack</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience level</Label>
              <select
                id="experience"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              >
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="focus">Focus areas</Label>
            <Textarea
              id="focus"
              placeholder="e.g. React, algorithms, leadership, system design..."
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4" />
                Generate prep pack
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
          <Button variant="outline" size="sm" onClick={generate}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
                  activeTab === tab.key
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted',
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <Card className="border-border/80 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base capitalize">
                {TABS.find((t) => t.key === activeTab)?.label} — {data.role}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderTabContent()}</CardContent>
          </Card>
        </motion.div>
      )}

      {!loading && !data && !error && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 font-medium">Ready to practice?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your target role and generate a full interview prep pack.
          </p>
        </div>
      )}
    </div>
  )
}
