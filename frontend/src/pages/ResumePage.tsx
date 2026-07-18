import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  Wand2,
  X,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
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
import { resumeApi } from '@/lib/api'
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
  skills_section?: {
    technical?: string[]
    tools?: string[]
    soft?: string[]
  }
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

export default function ResumePage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [resumeText, setResumeText] = useState('')
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [targetRole, setTargetRole] = useState(user?.career_path || 'Software Engineer')

  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [rewriting, setRewriting] = useState(false)

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [rewrite, setRewrite] = useState<RewriteResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        toast.success('Resume uploaded — text extracted successfully')
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

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleAnalyze = async () => {
    const hasText = resumeText.trim().length >= 50
    const hasId = Boolean(resumeId)

    if (!hasText && !hasId) {
      toast.error('Upload a PDF or paste at least 50 characters of resume text')
      return
    }

    setAnalyzing(true)
    setError(null)
    setRewrite(null)

    try {
      const payload = hasText
        ? { resume_text: resumeText, target_role: targetRole }
        : { resume_id: resumeId!, target_role: targetRole }

      const { data } = await resumeApi.analyze(payload)
      setAnalysis({
        overall_score: data.overall_score ?? 0,
        ats_score: data.ats_score ?? 0,
        formatting_score: data.formatting_score ?? 0,
        grammar_score: data.grammar_score ?? 0,
        projects_score: data.projects_score ?? 0,
        experience_score: data.experience_score ?? 0,
        education_score: data.education_score ?? 0,
        skills_score: data.skills_score ?? 0,
        career_confidence_score: data.career_confidence_score ?? 0,
        summary: data.summary ?? '',
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
        suggestions: data.suggestions ?? [],
        extracted_skills: data.extracted_skills ?? [],
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
      })
      setRewrite(data)
      toast.success('ATS-optimized rewrite ready')
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

  const copyRewrite = () => {
    const text = rewrite?.full_rewritten_text || rewrite?.rewritten_summary || ''
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Resume AI</h1>
        <p className="mt-1 text-muted-foreground">
          Upload, analyze, and ATS-optimize your resume for {targetRole}
        </p>
      </motion.div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload + text */}
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
                    if (file) handleFile(file)
                  }}
                />
                {uploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                ) : (
                  <FileText className="h-10 w-10 text-primary" />
                )}
                <p className="mt-4 text-sm font-medium">
                  {uploading ? 'Extracting text…' : 'Drop PDF here or click to browse'}
                </p>
                {filename && (
                  <Badge variant="success" className="mt-3">
                    {filename}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Resume Text</CardTitle>
              <CardDescription>
                Paste or edit extracted text. Required for ATS rewrite.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-role">Target Role</Label>
                <Input
                  id="target-role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
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
                  ATS Rewrite
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {resumeText.length} characters
                {resumeId && ' · Server copy available via upload ID'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
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

          {!analyzing && !analysis && (
            <EmptyState
              icon={FileText}
              title="No analysis yet"
              description="Upload your PDF or paste resume text, then run analysis to see scores and suggestions."
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
                      <ScoreBar
                        key={key}
                        label={label}
                        score={analysis[key] as number}
                      />
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
                      {analysis.strengths.length === 0 ? (
                        <p className="text-sm text-muted-foreground">None identified</p>
                      ) : (
                        <ul className="space-y-2">
                          {analysis.strengths.map((s) => (
                            <li key={s} className="flex gap-2 text-sm">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
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
                      {analysis.weaknesses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">None identified</p>
                      ) : (
                        <ul className="space-y-2">
                          {analysis.weaknesses.map((w) => (
                            <li key={w} className="flex gap-2 text-sm">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      )}
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
                    {analysis.suggestions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No suggestions returned</p>
                    ) : (
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
                    )}
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
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Wand2 className="h-5 w-5 text-primary" />
                          ATS Rewritten Content
                        </CardTitle>
                        <CardDescription>Optimized for {targetRole}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={copyRewrite}>
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
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
    </div>
  )
}
