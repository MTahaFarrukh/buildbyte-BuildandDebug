import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Upload,
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
import { downloadBase64Pdf, resumeApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
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
  rewritten_summary?: string
  ats_optimized_bullets?: string[]
}

interface RewriteResult {
  rewritten_summary?: string
  full_rewritten_text?: string
  ats_keywords_added?: string[]
  changes_made?: string[]
  tips?: string[]
  pdf_base64?: string
  pdf_filename?: string
  pdf_error?: string
  skills_section?: {
    technical?: string[]
    tools?: string[]
    soft?: string[]
  }
  contact?: Record<string, string>
  rewritten_experience?: unknown[]
  rewritten_projects?: unknown[]
  education?: unknown[]
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

const PRIORITY_VARIANT: Record<string, 'warning' | 'default' | 'outline'> = {
  high: 'warning',
  medium: 'default',
  low: 'outline',
}

type Tab = 'analyze' | 'build'

export default function ResumePage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('analyze')

  const [resumeText, setResumeText] = useState('')
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [targetRole, setTargetRole] = useState(user?.career_path || 'Software Engineer')

  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [building, setBuilding] = useState(false)

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [rewrite, setRewrite] = useState<RewriteResult | null>(null)
  const [built, setBuilt] = useState<RewriteResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Build-from-scratch form
  const [buildForm, setBuildForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    linkedin: user?.linkedin_url || '',
    github: user?.github_url || '',
    portfolio: user?.portfolio_url || '',
    education: '',
    experience: '',
    projects: '',
    skills: (user?.skills || []).join(', '),
    notes: '',
  })

  const updateBuild = (key: keyof typeof buildForm, value: string) =>
    setBuildForm((prev) => ({ ...prev, [key]: value }))

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Only PDF files are supported')
        return
      }
      if (!user?.id) {
        toast.error('Please sign in to upload a resume')
        return
      }

      setUploading(true)
      setError(null)
      setAnalysis(null)
      setRewrite(null)

      try {
        const { data } = await resumeApi.upload(file, user.id)
        setResumeId(data.resume_id)
        setFilename(data.filename)
        if (data.text_preview) {
          setResumeText(data.text_preview)
        }
        toast.success('PDF uploaded — expand/edit the extracted text below')
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          (e instanceof Error ? e.message : 'Upload failed')
        setError(msg)
        toast.error(msg)
      } finally {
        setUploading(false)
      }
    },
    [user?.id],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const handleAnalyze = async () => {
    const hasText = resumeText.trim().length >= 50
    const hasId = Boolean(resumeId)
    if (!hasText && !hasId) {
      toast.error('Upload a PDF or paste at least 50 characters of resume text')
      return
    }

    setAnalyzing(true)
    setError(null)
    try {
      const payload = hasText
        ? { resume_text: resumeText, target_role: targetRole }
        : { resume_id: resumeId!, target_role: targetRole }
      const { data } = await resumeApi.analyze(payload)
      setAnalysis({
        overall_score: data.overall_score,
        ats_score: data.ats_score,
        formatting_score: data.formatting_score,
        grammar_score: data.grammar_score,
        projects_score: data.projects_score,
        experience_score: data.experience_score,
        education_score: data.education_score,
        skills_score: data.skills_score,
        career_confidence_score: data.career_confidence_score,
        summary: data.summary,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        suggestions: data.suggestions || [],
        extracted_skills: data.extracted_skills || [],
        rewritten_summary: data.rewritten_summary,
        ats_optimized_bullets: data.ats_optimized_bullets,
      })
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
    if (resumeText.trim().length < 50) {
      toast.error('Paste your full resume text (50+ characters) for ATS rewrite')
      return
    }

    setRewriting(true)
    setError(null)
    try {
      const { data } = await resumeApi.rewrite({
        resume_text: resumeText,
        target_role: targetRole,
        full_name: user?.full_name,
        generate_pdf: true,
      })
      setRewrite(data)
      if (data.pdf_base64) {
        toast.success('ATS rewrite ready — PDF generated')
      } else {
        toast.success('ATS rewrite ready')
        if (data.pdf_error) toast.message('PDF generation issue — you can still copy the text')
      }
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
    setError(null)
    try {
      const { data } = await resumeApi.build({
        ...buildForm,
        target_role: targetRole,
        generate_pdf: true,
      })
      setBuilt(data)
      if (data.pdf_base64) toast.success('Resume built — download your PDF')
      else toast.success('Resume built')
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (e instanceof Error ? e.message : 'Build failed')
      setError(msg)
      toast.error(msg)
    } finally {
      setBuilding(false)
    }
  }

  const downloadPdf = (result: RewriteResult | null) => {
    if (!result?.pdf_base64) {
      toast.error('No PDF available yet')
      return
    }
    downloadBase64Pdf(result.pdf_base64, result.pdf_filename || 'CareerGPS_Resume.pdf')
    toast.success('PDF downloaded')
  }

  const copyText = (result: RewriteResult | null) => {
    const text = result?.full_rewritten_text || result?.rewritten_summary || ''
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Resume AI</h1>
        <p className="mt-1 text-muted-foreground">
          Analyze, ATS-rewrite, or build a brand-new resume PDF for {targetRole}
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === 'analyze' ? 'default' : 'outline'}
          onClick={() => setTab('analyze')}
        >
          <FileText className="h-4 w-4" />
          Analyze & Rewrite
        </Button>
        <Button
          variant={tab === 'build' ? 'default' : 'outline'}
          onClick={() => setTab('build')}
        >
          <PenLine className="h-4 w-4" />
          Build with AI
        </Button>
      </div>

      <div className="max-w-md space-y-2">
        <Label>Target role</Label>
        <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {tab === 'build' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-primary" />
                Tell AI about you
              </CardTitle>
              <CardDescription>
                No resume yet? We&apos;ll craft an ATS-ready PDF from your details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name *</Label>
                  <Input
                    value={buildForm.full_name}
                    onChange={(e) => updateBuild('full_name', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    value={buildForm.email}
                    onChange={(e) => updateBuild('email', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={buildForm.phone}
                    onChange={(e) => updateBuild('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input
                    value={buildForm.location}
                    onChange={(e) => updateBuild('location', e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>LinkedIn</Label>
                  <Input
                    value={buildForm.linkedin}
                    onChange={(e) => updateBuild('linkedin', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>GitHub</Label>
                  <Input
                    value={buildForm.github}
                    onChange={(e) => updateBuild('github', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Portfolio</Label>
                  <Input
                    value={buildForm.portfolio}
                    onChange={(e) => updateBuild('portfolio', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Education</Label>
                <Textarea
                  value={buildForm.education}
                  onChange={(e) => updateBuild('education', e.target.value)}
                  placeholder="B.S. Computer Science — University Name — 2026"
                  className="min-h-[72px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Experience / Internships</Label>
                <Textarea
                  value={buildForm.experience}
                  onChange={(e) => updateBuild('experience', e.target.value)}
                  placeholder="Role, company, what you did…"
                  className="min-h-[88px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Projects</Label>
                <Textarea
                  value={buildForm.projects}
                  onChange={(e) => updateBuild('projects', e.target.value)}
                  placeholder="Project name + what you built + tech stack"
                  className="min-h-[88px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Skills (comma-separated)</Label>
                <Input
                  value={buildForm.skills}
                  onChange={(e) => updateBuild('skills', e.target.value)}
                  placeholder="Python, React, SQL…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Extra notes</Label>
                <Textarea
                  value={buildForm.notes}
                  onChange={(e) => updateBuild('notes', e.target.value)}
                  placeholder="Achievements, languages, preferences…"
                  className="min-h-[64px]"
                />
              </div>
              <Button onClick={handleBuild} disabled={building} className="w-full sm:w-auto">
                {building ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Build Resume PDF
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {!built && !building && (
              <EmptyState
                icon={PenLine}
                title="Your AI resume will appear here"
                description="Fill in your details and click Build Resume PDF. We'll generate an ATS-friendly document you can download."
              />
            )}
            {building && (
              <Card>
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-40" />
                </CardContent>
              </Card>
            )}
            <AnimatePresence>
              {built && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="glass border-accent/30">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-accent" />
                            AI-Built Resume
                          </CardTitle>
                          <CardDescription>Ready for {targetRole}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => downloadPdf(built)}
                            disabled={!built.pdf_base64}
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyText(built)}>
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {built.tips && built.tips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {built.tips.map((t) => (
                            <Badge key={t} variant="accent">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {built.full_rewritten_text || built.rewritten_summary}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Resume
                </CardTitle>
                <CardDescription>PDF only · max 10MB · text extracted automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition',
                    dragOver
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleFile(file)
                    }}
                  />
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">
                    {filename ? filename : 'Drop PDF here or click to browse'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Resume text</CardTitle>
                <CardDescription>
                  Paste or edit extracted text. Required for ATS rewrite + PDF.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here…"
                  className="min-h-[200px] font-mono text-xs leading-relaxed"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAnalyze} disabled={analyzing || uploading}>
                    {analyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Analyze Resume
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleRewrite}
                    disabled={rewriting || resumeText.trim().length < 50}
                  >
                    {rewriting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    ATS Rewrite + PDF
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {resumeText.length} characters
                  {resumeId && ' · Server copy available via upload ID'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {analyzing && !analysis && (
              <Card>
                <CardContent className="space-y-4 p-6">
                  <Skeleton className="h-8 w-48" />
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </CardContent>
              </Card>
            )}

            {!analyzing && !analysis && !rewrite && (
              <EmptyState
                icon={FileText}
                title="No analysis yet"
                description="Upload your PDF or paste resume text, then Analyze or run ATS Rewrite + PDF."
              />
            )}

            <AnimatePresence>
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card
                    className={cn(
                      'glass border bg-gradient-to-br',
                      scoreBg(analysis.overall_score),
                    )}
                  >
                    <CardHeader>
                      <CardTitle>Analysis Summary</CardTitle>
                      <CardDescription className={scoreColor(analysis.overall_score)}>
                        Overall: {analysis.overall_score}/100
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{analysis.summary}</p>
                      {analysis.extracted_skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {analysis.extracted_skills.map((s) => (
                            <Badge key={s} variant="accent">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle>Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {SCORE_FIELDS.map(({ key, label }) => (
                        <ScoreBar key={key} label={label} score={analysis[key] as number} />
                      ))}
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="glass border-emerald-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <ThumbsUp className="h-4 w-4 text-emerald-400" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.strengths.map((s) => (
                            <li key={s} className="flex gap-2 text-sm">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="glass border-amber-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <ThumbsDown className="h-4 w-4 text-amber-400" />
                          Weaknesses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.weaknesses.map((w) => (
                            <li key={w} className="flex gap-2 text-sm">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-accent" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.suggestions.map((s, i) => (
                          <li
                            key={i}
                            className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3"
                          >
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <Badge variant={PRIORITY_VARIANT[s.priority] ?? 'outline'}>
                                {s.priority}
                              </Badge>
                              <Badge variant="outline">{s.category}</Badge>
                            </div>
                            <p className="text-sm">{s.suggestion}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {rewrite && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="glass border-primary/30">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-primary" />
                            ATS Rewritten Resume
                          </CardTitle>
                          <CardDescription>Optimized for {targetRole}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => downloadPdf(rewrite)}
                            disabled={!rewrite.pdf_base64}
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyText(rewrite)}>
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {rewrite.changes_made && rewrite.changes_made.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {rewrite.changes_made.map((c) => (
                            <Badge key={c} variant="success">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {rewrite.ats_keywords_added && rewrite.ats_keywords_added.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Keywords added
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {rewrite.ats_keywords_added.map((k) => (
                              <Badge key={k} variant="accent">
                                {k}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {rewrite.full_rewritten_text || rewrite.rewritten_summary}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
