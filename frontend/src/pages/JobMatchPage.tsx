import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Sparkles,
  Target,
  TrendingUp,
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
import { EmptyState, ProgressCircle, Skeleton } from '@/components/ui/progress'
import { jobApi } from '@/lib/api'
import { cn, scoreBg, scoreColor } from '@/lib/utils'

interface JobAnalysis {
  match_percentage: number
  missing_skills: string[]
  matching_skills: string[]
  weak_areas: string[]
  keywords_missing: string[]
  technologies_missing: string[]
  suggested_improvements: { area: string; action: string; impact: string }[]
  cover_letter_tips: string[]
  interview_focus_areas?: string[]
  summary: string
}

const IMPACT_VARIANT: Record<string, 'warning' | 'default' | 'outline'> = {
  high: 'warning',
  medium: 'default',
  low: 'outline',
}

export default function JobMatchPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 50) {
      toast.error('Resume text must be at least 50 characters')
      return
    }
    if (jobDescription.trim().length < 50) {
      toast.error('Job description must be at least 50 characters')
      return
    }

    setAnalyzing(true)
    setError(null)

    try {
      const { data } = await jobApi.analyze({
        resume_text: resumeText,
        job_description: jobDescription,
      })
      setAnalysis({
        match_percentage: data.match_percentage ?? 0,
        missing_skills: data.missing_skills ?? [],
        matching_skills: data.matching_skills ?? [],
        weak_areas: data.weak_areas ?? [],
        keywords_missing: data.keywords_missing ?? [],
        technologies_missing: data.technologies_missing ?? [],
        suggested_improvements: data.suggested_improvements ?? [],
        cover_letter_tips: data.cover_letter_tips ?? [],
        interview_focus_areas: data.interview_focus_areas ?? [],
        summary: data.summary ?? '',
      })
      toast.success('Job match analysis complete')
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

  const clearAll = () => {
    setResumeText('')
    setJobDescription('')
    setAnalysis(null)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Job Match Engine</h1>
        <p className="mt-1 text-muted-foreground">
          Compare your resume against any job description and get actionable fixes
        </p>
      </motion.div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Your Resume
            </CardTitle>
            <CardDescription>Paste resume text from Resume AI or your document</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here…"
              className="min-h-[280px] font-mono text-xs leading-relaxed"
            />
            <p className="mt-2 text-xs text-muted-foreground">{resumeText.length} characters</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-secondary" />
              Job Description
            </CardTitle>
            <CardDescription>Paste the full JD from LinkedIn, Indeed, or company site</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here…"
              className="min-h-[280px] text-xs leading-relaxed"
            />
            <p className="mt-2 text-xs text-muted-foreground">{jobDescription.length} characters</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Analyze Match
        </Button>
        <Button size="lg" variant="outline" onClick={clearAll} disabled={analyzing}>
          Clear
        </Button>
      </div>

      {analyzing && !analysis && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      )}

      {!analyzing && !analysis && (
        <EmptyState
          icon={Target}
          title="Ready to compare"
          description="Paste your resume and a job description, then run analysis to see your match score and gaps."
        />
      )}

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Match score hero */}
            <Card
              className={cn(
                'glass overflow-hidden border bg-gradient-to-br',
                scoreBg(analysis.match_percentage),
              )}
            >
              <CardContent className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-muted-foreground">Match Score</p>
                  <p className={cn('mt-1 text-4xl font-bold', scoreColor(analysis.match_percentage))}>
                    {analysis.match_percentage}%
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-relaxed">{analysis.summary}</p>
                </div>
                <ProgressCircle
                  value={analysis.match_percentage}
                  size={130}
                  stroke={11}
                  label="Match"
                />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Matching skills */}
              <Card className="glass border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Matching Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.matching_skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No direct skill matches detected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {analysis.matching_skills.map((s) => (
                        <Badge key={s} variant="success">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Missing skills */}
              <Card className="glass border-rose-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-rose-400" />
                    Missing Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.missing_skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No critical skill gaps found</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_skills.map((s) => (
                        <Badge key={s} variant="warning">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-amber-400" />
                    Weak Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.weak_areas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None identified</p>
                  ) : (
                    <ul className="space-y-2">
                      {analysis.weak_areas.map((w) => (
                        <li key={w} className="flex gap-2 text-sm">
                          <span className="text-amber-400">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-accent" />
                    Keywords Missing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.keywords_missing.length === 0 ? (
                    <p className="text-sm text-muted-foreground">ATS keywords look good</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keywords_missing.map((k) => (
                        <Badge key={k} variant="outline">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wrench className="h-4 w-4 text-secondary" />
                    Technologies Missing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.technologies_missing.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Tech stack aligns well</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.technologies_missing.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Suggested improvements */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Suggested Improvements
                </CardTitle>
                <CardDescription>Prioritized actions to boost your match score</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.suggested_improvements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No improvements suggested</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {analysis.suggested_improvements.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-border/80 bg-muted/20 p-4"
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{item.area}</Badge>
                          <Badge variant={IMPACT_VARIANT[item.impact] ?? 'default'}>
                            {item.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm">{item.action}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover letter tips */}
            <Card className="glass border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-accent" />
                  Cover Letter Tips
                </CardTitle>
                <CardDescription>Tailored advice for this application</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.cover_letter_tips.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No cover letter tips returned</p>
                ) : (
                  <ul className="space-y-3">
                    {analysis.cover_letter_tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {analysis.interview_focus_areas && analysis.interview_focus_areas.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-base">Interview Focus Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.interview_focus_areas.map((area) => (
                      <Badge key={area} variant="default">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
