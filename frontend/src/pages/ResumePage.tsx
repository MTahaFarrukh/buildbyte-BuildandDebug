import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Wand2,
  X,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  PenLine,
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
import { EmptyState, ScoreBar, Skeleton } from '@/components/ui/progress'
import { ResumePdfUploader } from '@/components/ResumePdfUploader'
import { downloadBase64Pdf, resumeApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/store/workspace'
import { RecommendationBanner } from '@/components/RecommendationBanner'
import { cn, scoreBg, scoreColor } from '@/lib/utils'

interface ResumeAnalysis {
  overall_score: number
  ats_score: number
  formatting_score: number
  grammar_score: number
  projects_score: number
  experience_score: number
  education_score: number
  skills_score: number
  career_confidence_score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: { category: string; priority: string; suggestion: string }[]
  extracted_skills: string[]
}

interface RewriteResult {
  rewritten_summary?: string
  full_rewritten_text?: string
  ats_keywords_added?: string[]
  changes_made?: string[]
  tips?: string[]
  pdf_base64?: string
  pdf_filename?: string
}

const SCORE_FIELDS: { key: keyof ResumeAnalysis; label: string }[] = [
  { key: 'overall_score', label: 'Overall Score' },
  { key: 'ats_score', label: 'ATS Compatibility' },
  { key: 'formatting_score', label: 'Formatting' },
  { key: 'grammar_score', label: 'Grammar & Clarity' },
  { key: 'projects_score', label: 'Projects' },
  { key: 'experience_score', label: 'Experience' },
  { key: 'education_score', label: 'Education' },
  { key: 'skills_score', label: 'Skills' },
  { key: 'career_confidence_score', label: 'Career Confidence' },
]

type Tab = 'analyze' | 'build'

export default function ResumePage() {
  const { user } = useAuth()
  const {
    resumeId,
    resumeFilename,
    resumeText,
    resumeAnalysis,
    resumeRewrite,
    targetRole,
    setResumeUpload,
    setResumeAnalysis,
    setResumeRewrite,
    setTargetRole,
  } = useWorkspace()

  const [tab, setTab] = useState<Tab>('analyze')
  const [analyzing, setAnalyzing] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [building, setBuilding] = useState(false)
  const [built, setBuilt] = useState<RewriteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [localRole, setLocalRole] = useState(targetRole || user?.career_path || 'Software Engineer')

  const [buildForm, setBuildForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    education: '',
    experience: '',
    projects: '',
    skills: '',
    notes: '',
  })

  const analysis = resumeAnalysis as unknown as ResumeAnalysis | null
  const rewrite = resumeRewrite as RewriteResult | null
  const hasPdf = Boolean(resumeId && resumeText.trim().length >= 50)

  const handleAnalyze = async () => {
    if (!hasPdf) {
      toast.error('Upload a resume PDF first')
      return
    }
    setAnalyzing(true)
    setError(null)
    setTargetRole(localRole)
    try {
      const { data } = await resumeApi.analyze({
        resume_text: resumeText,
        resume_id: resumeId || undefined,
        target_role: localRole,
      })
      setResumeAnalysis(data)
      toast.success('Resume analyzed')
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

  const handleRewrite = async () => {
    if (!hasPdf) {
      toast.error('Upload a resume PDF first')
      return
    }
    setRewriting(true)
    setError(null)
    try {
      const { data } = await resumeApi.rewrite({
        resume_text: resumeText,
        target_role: localRole,
        full_name: user?.full_name,
        generate_pdf: true,
      })
      setResumeRewrite(data)
      toast.success(data.pdf_base64 ? 'ATS rewrite + PDF ready' : 'ATS rewrite ready')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (e instanceof Error ? e.message : 'Rewrite failed')
      setError(msg)
      toast.error(msg)
    } finally {
      setRewriting(false)
    }
  }

  const handleBuild = async () => {
    if (!buildForm.full_name.trim()) {
      toast.error('Full name is required')
      return
    }
    setBuilding(true)
    try {
      const { data } = await resumeApi.build({
        ...buildForm,
        target_role: localRole,
        generate_pdf: true,
      })
      setBuilt(data)
      toast.success('Resume built')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Build failed')
    } finally {
      setBuilding(false)
    }
  }

  const downloadPdf = (result: RewriteResult | null) => {
    if (!result?.pdf_base64) {
      toast.error('No PDF available')
      return
    }
    downloadBase64Pdf(result.pdf_base64, result.pdf_filename || 'CareerGPS_Resume.pdf')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Resume AI</h1>
        <p className="mt-1 text-muted-foreground">
          Upload a PDF, analyze ATS fitness, rewrite, and download an optimized resume.
        </p>
      </motion.div>

      <RecommendationBanner />

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'analyze' ? 'default' : 'outline'} onClick={() => setTab('analyze')}>
          <FileText className="h-4 w-4" /> Analyze & Rewrite
        </Button>
        <Button variant={tab === 'build' ? 'default' : 'outline'} onClick={() => setTab('build')}>
          <PenLine className="h-4 w-4" /> Build with AI
        </Button>
      </div>

      <div className="max-w-md space-y-2">
        <Label>Target role</Label>
        <Input
          value={localRole}
          onChange={(e) => setLocalRole(e.target.value)}
          onBlur={() => setTargetRole(localRole)}
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
          <span>{error}</span>
          <button className="ml-auto" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {tab === 'build' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Build resume from scratch</CardTitle>
              <CardDescription>No PDF? Generate an ATS-ready resume PDF from your details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  ['full_name', 'Full name *'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['location', 'Location'],
                  ['skills', 'Skills (comma-separated)'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input
                    value={buildForm[key]}
                    onChange={(e) => setBuildForm((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              {(['education', 'experience', 'projects', 'notes'] as const).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label className="capitalize">{key}</Label>
                  <Textarea
                    value={buildForm[key]}
                    onChange={(e) => setBuildForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="min-h-[72px]"
                  />
                </div>
              ))}
              <Button onClick={handleBuild} disabled={building}>
                {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Build Resume PDF
              </Button>
            </CardContent>
          </Card>
          <div>
            {built ? (
              <Card className="glass border-accent/30">
                <CardHeader>
                  <div className="flex justify-between gap-2">
                    <CardTitle>AI-Built Resume</CardTitle>
                    <Button size="sm" onClick={() => downloadPdf(built)} disabled={!built.pdf_base64}>
                      <Download className="h-4 w-4" /> PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm">
                    {built.full_rewritten_text || built.rewritten_summary}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <EmptyState
                icon={PenLine}
                title="Your AI resume will appear here"
                description="Fill details and build a downloadable PDF."
              />
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Upload Resume PDF</CardTitle>
                <CardDescription>Text is extracted automatically — no paste required.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResumePdfUploader
                  filename={resumeFilename}
                  onUploaded={setResumeUpload}
                />
                {hasPdf && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Parsed {resumeText.length.toLocaleString()} characters from {resumeFilename}
                  </p>
                )}
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAnalyze} disabled={analyzing || !hasPdf}>
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze Resume
              </Button>
              <Button variant="secondary" onClick={handleRewrite} disabled={rewriting || !hasPdf}>
                {rewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                ATS Rewrite + PDF
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {!hasPdf && !analysis && (
              <EmptyState
                icon={FileText}
                title="No resume uploaded yet"
                description="Upload a PDF to unlock analysis, ATS rewrite, Career Score, and Job Prep."
                action={
                  <p className="text-xs text-muted-foreground">Use the uploader on the left →</p>
                }
              />
            )}
            {analyzing && !analysis && (
              <Card>
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-24" />
                </CardContent>
              </Card>
            )}
            <AnimatePresence>
              {analysis && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Card className={cn('glass border bg-gradient-to-br', scoreBg(analysis.overall_score))}>
                    <CardHeader>
                      <CardTitle>Analysis Summary</CardTitle>
                      <CardDescription className={scoreColor(analysis.overall_score)}>
                        Overall: {analysis.overall_score}/100
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{analysis.summary}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {SCORE_FIELDS.map(({ key, label }) => (
                        <ScoreBar key={key} label={label} score={Number(analysis[key] || 0)} />
                      ))}
                    </CardContent>
                  </Card>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="glass">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <ThumbsUp className="h-4 w-4 text-emerald-400" /> Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {(analysis.strengths || []).map((s) => (
                            <li key={s} className="flex gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="glass">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <ThumbsDown className="h-4 w-4 text-amber-400" /> Weaknesses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {(analysis.weaknesses || []).map((w) => (
                            <li key={w} className="flex gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400" /> {w}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-accent" /> Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(analysis.suggestions || []).map((s, i) => (
                        <div key={i} className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
                          <Badge variant="outline">{s.priority}</Badge>{' '}
                          <span className="text-muted-foreground">{s.category}</span>
                          <p className="mt-1">{s.suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            {rewrite && (
              <Card className="glass border-primary/30">
                <CardHeader>
                  <div className="flex flex-wrap justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-primary" /> ATS Rewritten Resume
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadPdf(rewrite)} disabled={!rewrite.pdf_base64}>
                        <Download className="h-4 w-4" /> PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            rewrite.full_rewritten_text || rewrite.rewritten_summary || '',
                          )
                          toast.success('Copied')
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm">
                    {rewrite.full_rewritten_text || rewrite.rewritten_summary}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
