import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Briefcase,
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Wrench,
  X,
  Zap,
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
import { Textarea, Label, Badge } from '@/components/ui/input'
import { EmptyState, ProgressCircle, Skeleton, ScoreBar } from '@/components/ui/progress'
import { ResumePdfUploader } from '@/components/ResumePdfUploader'
import { jobApi, chatApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { buildMentorContext, useWorkspace } from '@/store/workspace'
import { RecommendationBanner } from '@/components/RecommendationBanner'
import { cn, scoreBg, scoreColor } from '@/lib/utils'

type TabId = 'match' | 'interview' | 'chat'
type Step = 1 | 2 | 3

interface JobMatchData {
  match_percentage?: number
  missing_skills?: string[]
  matching_skills?: string[]
  weak_areas?: string[]
  keywords_missing?: string[]
  suggested_improvements?: { area: string; action: string; impact: string }[]
  summary?: string
  interview_focus_areas?: string[]
}

interface SkillGapData {
  overall_readiness?: number
  missing_skills?: Array<string | { skill?: string; priority?: string; reason?: string }>
  learning_path?: string[]
  summary?: string
}

interface InterviewData {
  role?: string
  technical_questions?: Record<string, unknown>[]
  behavioral_questions?: Record<string, unknown>[]
  hr_questions?: Record<string, unknown>[]
  coding_questions?: Record<string, unknown>[]
  mock_interview?: Record<string, unknown>
}

const STEPS = [
  { n: 1 as Step, label: 'Upload Resume PDF', icon: FileText },
  { n: 2 as Step, label: 'Paste Job Description', icon: Briefcase },
  { n: 3 as Step, label: 'Run Analysis', icon: Sparkles },
]

export default function JobPrepCopilotPage() {
  const { user } = useAuth()
  const ws = useWorkspace()
  const {
    resumeFilename,
    resumeText,
    jobDescription,
    jobMatch,
    skillGap,
    interviewPrep,
    interviewReadiness,
    jobPrepChat,
    ragCollectionId,
    targetRole,
    setResumeUpload,
    setJobDescription,
    setJobMatch,
    setSkillGap,
    setInterviewPrep,
    setInterviewReadiness,
    setRagCollectionId,
    setJobPrepChat,
    appendJobPrepChat,
    addMockInterview,
    mockInterviews,
  } = ws

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [localJd, setLocalJd] = useState(jobDescription)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('match')
  const [error, setError] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const match = jobMatch as JobMatchData | null
  const gap = skillGap as SkillGapData | null
  const interview = interviewPrep as InterviewData | null

  const hasResume = Boolean(pdfFile || resumeFilename || resumeText.trim().length >= 50)
  const jdValid = localJd.trim().length >= 50
  const hasResults = Boolean(match)
  const currentStep: Step = !hasResume ? 1 : !jdValid ? 2 : 3

  const handleUploaded = useCallback(
    (data: { resumeId: string; filename: string; text: string }) => {
      setResumeUpload(data)
      setError(null)
    },
    [setResumeUpload],
  )

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF resume')
      return
    }
    setPdfFile(file)
  }

  const handleAnalyze = async () => {
    if (!pdfFile && !resumeFilename) {
      toast.error('Upload a resume PDF first')
      return
    }
    if (!jdValid) {
      toast.error('Job description must be at least 50 characters')
      return
    }
    if (!user?.id) {
      toast.error('Please sign in')
      return
    }

    setAnalyzing(true)
    setError(null)
    setJobDescription(localJd)

    try {
      if (!pdfFile) {
        toast.error('Re-upload your resume PDF to run analysis')
        setAnalyzing(false)
        return
      }

      const { data } = await jobApi.analyzePdf(
        pdfFile,
        localJd.trim(),
        user.id,
        targetRole || user.career_path || 'Software Engineer',
      )

      if (data.resume_text || data.resume_text_preview) {
        setResumeUpload({
          resumeId: data.resume_id || `job-${Date.now()}`,
          filename: data.filename || pdfFile.name,
          text: String(data.resume_text || data.resume_text_preview || ''),
        })
      }

      setJobMatch(data.match || {})
      setSkillGap(data.skill_gap || {})
      setInterviewPrep(data.interview || {})
      setInterviewReadiness(Number(data.interview_readiness ?? 0))
      if (data.collection_id) setRagCollectionId(data.collection_id)

      const readiness = Number(data.interview_readiness ?? 0)
      const match = data.match || {}
      addMockInterview({
        date: new Date().toISOString(),
        role: String(data.interview?.role || targetRole || 'Target role'),
        difficulty: 'intermediate',
        score: readiness || Number(match.match_percentage ?? 50),
        weakAreas: (match.weak_areas || match.missing_skills || []).slice(0, 5).map(String),
        strongAreas: (match.matching_skills || []).slice(0, 5).map(String),
        suggestions: (match.suggested_improvements || [])
          .slice(0, 3)
          .map((s: { action?: string; suggestion?: string }) =>
            String(s.action || s.suggestion || ''),
          )
          .filter(Boolean),
      })

      setActiveTab('match')
      toast.success('Job prep analysis complete — interview session logged')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (e instanceof Error ? e.message : 'Analysis failed')
      setError(msg)
      toast.error(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  const sendChat = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || chatLoading) return

    appendJobPrepChat({ role: 'user', content: trimmed })
    setChatInput('')
    setChatLoading(true)

    try {
      const { data } = await chatApi.send({
        message: trimmed,
        chat_history: jobPrepChat.map((m) => ({ role: m.role, content: m.content })),
        user_context: buildMentorContext(),
        collection_id: ragCollectionId || undefined,
      })
      appendJobPrepChat({ role: 'assistant', content: data.reply })
      setTimeout(() => {
        chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 50)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Chat failed'
      toast.error(msg)
    } finally {
      setChatLoading(false)
    }
  }

  const missingSkills = (match?.missing_skills || []).slice(0, 8)
  const improvements = match?.suggested_improvements || []

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">AI Job Preparation Copilot</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your resume, paste a job description, and get match analysis, skill gaps, and
          interview prep in one flow.
        </p>
      </motion.div>

      <RecommendationBanner />

      {mockInterviews.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Interview performance history</CardTitle>
            <CardDescription>Every analysis session is tracked for improvement over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockInterviews.slice(0, 6).map((iv) => (
              <div
                key={iv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{iv.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(iv.date).toLocaleDateString()} · {iv.difficulty}
                    {iv.weakAreas.length ? ` · Focus: ${iv.weakAreas.slice(0, 2).join(', ')}` : ''}
                  </p>
                </div>
                <span className={cn('text-lg font-bold', scoreColor(iv.score))}>{iv.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Step flow */}
      <Card className="glass border-primary/20">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const done =
                step.n === 1 ? hasResume : step.n === 2 ? jdValid : hasResults
              const active = currentStep === step.n
              return (
                <div key={step.n} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                      active && 'bg-primary/15 text-primary',
                      done && !active && 'text-emerald-400',
                      !done && !active && 'text-muted-foreground',
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">Step {step.n}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden h-px w-6 bg-border sm:block" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Step 1 — Resume PDF</Label>
                <ResumePdfUploader
                  filename={resumeFilename}
                  onFileSelected={setPdfFile}
                  onUploaded={handleUploaded}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Or select a file for analysis (required at run time):
                </p>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileSelect(f)
                  }}
                />
                {pdfFile && (
                  <p className="mt-1 text-xs text-emerald-400">Ready: {pdfFile.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="jd">Step 2 — Job Description</Label>
                <Textarea
                  id="jd"
                  value={localJd}
                  onChange={(e) => setLocalJd(e.target.value)}
                  placeholder="Paste the full job posting here…"
                  className="mt-2 min-h-[180px] text-sm leading-relaxed"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {localJd.length} characters {jdValid ? '· ready' : '· need 50+'}
                </p>
              </div>
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleAnalyze}
                disabled={analyzing || !pdfFile || !jdValid}
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Step 3 — Run Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {analyzing && !hasResults && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Dashboard cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className={cn('glass border bg-gradient-to-br', scoreBg(match?.match_percentage ?? 0))}>
              <CardContent className="flex flex-col items-center p-5">
                <ProgressCircle value={match?.match_percentage ?? 0} size={88} stroke={8} label="Match" />
                <p className={cn('mt-2 text-xs font-medium', scoreColor(match?.match_percentage ?? 0))}>
                  Job match
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Wrench className="h-4 w-4 text-primary" />
                  ATS / Improvements
                </div>
                <p className="mt-2 text-2xl font-bold">{improvements.length}</p>
                <p className="text-xs text-muted-foreground">action items</p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="h-4 w-4 text-secondary" />
                  Missing skills
                </div>
                <p className="mt-2 text-2xl font-bold">{missingSkills.length}</p>
                <p className="text-xs text-muted-foreground">to close gaps</p>
              </CardContent>
            </Card>

            <Card className="glass border-accent/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-4 w-4 text-accent" />
                  Interview readiness
                </div>
                <p className={cn('mt-2 text-2xl font-bold', scoreColor(interviewReadiness ?? 0))}>
                  {interviewReadiness ?? 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="glass sm:col-span-2 lg:col-span-1">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Skill gap
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed">
                  {gap?.summary ||
                    `Readiness ${gap?.overall_readiness ?? '—'}% · ${(gap?.learning_path || []).length} learning steps`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card/60 p-2">
            {(
              [
                { id: 'match' as TabId, label: 'Match Details', icon: Briefcase },
                { id: 'interview' as TabId, label: 'Interview Prep', icon: MessageSquare },
                { id: 'chat' as TabId, label: 'RAG Chat', icon: Bot },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary/20 to-secondary/10 shadow-sm'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
              {activeTab === 'match' && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="glass lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Match summary</CardTitle>
                      <CardDescription>{match?.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScoreBar label="Match %" score={match?.match_percentage ?? 0} />
                    </CardContent>
                  </Card>

                  {improvements.length > 0 && (
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-base">ATS & improvements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {improvements.map((imp, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm"
                          >
                            <div className="mb-1 flex flex-wrap gap-2">
                              <Badge variant="outline">{imp.area}</Badge>
                              <Badge variant="secondary">{imp.impact}</Badge>
                            </div>
                            <p>{imp.action}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-base">Missing skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((s) => (
                          <Badge key={s} variant="warning">
                            {s}
                          </Badge>
                        ))}
                        {missingSkills.length === 0 && (
                          <p className="text-sm text-muted-foreground">No major gaps detected.</p>
                        )}
                      </div>
                      {(match?.matching_skills || []).length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Matching</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(match?.matching_skills || []).slice(0, 12).map((s) => (
                              <Badge key={s} variant="success">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'interview' && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Interview preparation</CardTitle>
                    <CardDescription>
                      Role: {interview?.role || targetRole} · Readiness {interviewReadiness ?? 0}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!interview ? (
                      <EmptyState
                        icon={MessageSquare}
                        title="No interview prep"
                        description="Run analysis to generate interview questions."
                      />
                    ) : (
                      <>
                        {[
                          { key: 'technical_questions', label: 'Technical' },
                          { key: 'behavioral_questions', label: 'Behavioral' },
                          { key: 'hr_questions', label: 'HR' },
                          { key: 'coding_questions', label: 'Coding' },
                        ].map(({ key, label }) => {
                          const qs = (interview[key as keyof InterviewData] as Record<string, unknown>[]) || []
                          if (!qs.length) return null
                          return (
                            <div key={key}>
                              <p className="mb-2 text-sm font-semibold">{label}</p>
                              <ul className="space-y-2">
                                {qs.slice(0, 5).map((q, i) => (
                                  <li
                                    key={i}
                                    className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm"
                                  >
                                    {String(q.question || q.q || JSON.stringify(q))}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'chat' && (
                <Card className="glass overflow-hidden">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bot className="h-5 w-5 text-primary" />
                      RAG chat — ask about this job & resume
                    </CardTitle>
                    <CardDescription>
                      Uses your uploaded documents
                      {ragCollectionId ? ' · collection linked' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col p-0">
                    <div
                      ref={chatScrollRef}
                      className="max-h-80 min-h-[240px] overflow-y-auto p-4 space-y-3"
                    >
                      {jobPrepChat.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          Ask how to improve your match, prepare for interviews, or address skill
                          gaps.
                        </p>
                      ) : (
                        jobPrepChat.map((msg, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex gap-2',
                              msg.role === 'user' ? 'justify-end' : 'justify-start',
                            )}
                          >
                            {msg.role === 'assistant' && (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                <Bot className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <div
                              className={cn(
                                'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                                msg.role === 'user'
                                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                                  : 'border border-border bg-muted/40',
                              )}
                            >
                              {msg.content}
                            </div>
                            {msg.role === 'user' && (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <User className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      {chatLoading && (
                        <div className="flex gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Thinking…</span>
                        </div>
                      )}
                    </div>
                    <form
                      className="flex gap-2 border-t border-border p-4"
                      onSubmit={(e) => {
                        e.preventDefault()
                        void sendChat(chatInput)
                      }}
                    >
                      <Textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about this role…"
                        className="min-h-[44px] resize-none"
                        disabled={chatLoading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            void sendChat(chatInput)
                          }
                        }}
                      />
                      <Button type="submit" size="icon" disabled={chatLoading || !chatInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                    {jobPrepChat.length > 0 && (
                      <div className="border-t border-border px-4 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setJobPrepChat([])}
                        >
                          Clear chat
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {!analyzing && !hasResults && (
        <EmptyState
          icon={Briefcase}
          title="No analysis yet"
          description="Complete the steps above — upload PDF, paste job description, and run analysis."
        />
      )}
    </div>
  )
}
