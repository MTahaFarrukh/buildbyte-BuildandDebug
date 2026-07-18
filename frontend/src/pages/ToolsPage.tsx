import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  Share2,
  Globe,
  GitBranch,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea, Badge } from '@/components/ui/input'
import { Progress, ScoreBar } from '@/components/ui/progress'
import { bonusApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { cn, scoreColor } from '@/lib/utils'

type PanelKey = 'linkedin' | 'portfolio' | 'github'

const PANELS: {
  key: PanelKey
  title: string
  description: string
  icon: typeof Share2
  color: string
}[] = [
  {
    key: 'linkedin',
    title: 'LinkedIn Review',
    description: 'Optimize headline, about, and keywords for your target role',
    icon: Share2,
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
  },
  {
    key: 'portfolio',
    title: 'Portfolio Review',
    description: 'Design, content, and project presentation feedback',
    icon: Globe,
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  },
  {
    key: 'github',
    title: 'GitHub Analysis',
    description: 'Profile strength, README tips, and pin recommendations',
    icon: GitBranch,
    color: 'from-gray-500/20 to-gray-600/10 border-gray-500/20',
  },
]

interface LinkedInResult {
  overall_score?: number
  headline_score?: number
  about_score?: number
  experience_score?: number
  strengths?: string[]
  improvements?: { section: string; issue: string; suggestion: string; rewritten_example?: string }[]
  keyword_recommendations?: string[]
  rewritten_headline?: string
  rewritten_about?: string
}

interface PortfolioResult {
  overall_score?: number
  design_feedback?: string[]
  content_feedback?: string[]
  project_presentation?: string[]
  missing_elements?: string[]
  improvements?: { priority: string; suggestion: string }[]
  standout_tips?: string[]
}

interface GitHubResult {
  overall_score?: number
  profile_strengths?: string[]
  weaknesses?: string[]
  repository_recommendations?: { action: string; why: string }[]
  readme_tips?: string[]
  contribution_advice?: string[]
  pin_recommendations?: string[]
  summary?: string
}

export default function ToolsPage() {
  const { user } = useAuth()
  const [activePanel, setActivePanel] = useState<PanelKey>('linkedin')

  const [linkedinContent, setLinkedinContent] = useState('')
  const [targetRole, setTargetRole] = useState(user?.career_path || 'Software Engineer')
  const [portfolioContent, setPortfolioContent] = useState('')
  const [careerPath, setCareerPath] = useState(user?.career_path || 'Software Engineer')
  const [githubInfo, setGithubInfo] = useState('')

  const [linkedinResult, setLinkedinResult] = useState<LinkedInResult | null>(null)
  const [portfolioResult, setPortfolioResult] = useState<PortfolioResult | null>(null)
  const [githubResult, setGithubResult] = useState<GitHubResult | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activePanel === 'linkedin') {
        if (!linkedinContent.trim()) {
          toast.error('Paste your LinkedIn profile content')
          setLoading(false)
          return
        }
        const { data } = await bonusApi.linkedin({
          profile_content: linkedinContent,
          target_role: targetRole,
        })
        setLinkedinResult(data as LinkedInResult)
        toast.success('LinkedIn review complete')
      } else if (activePanel === 'portfolio') {
        if (!portfolioContent.trim()) {
          toast.error('Paste your portfolio content or URL description')
          setLoading(false)
          return
        }
        const { data } = await bonusApi.portfolio({
          portfolio_content: portfolioContent,
          career_path: careerPath,
        })
        setPortfolioResult(data as PortfolioResult)
        toast.success('Portfolio review complete')
      } else {
        if (!githubInfo.trim()) {
          toast.error('Paste your GitHub profile info')
          setLoading(false)
          return
        }
        const { data } = await bonusApi.github({
          github_info: githubInfo,
          target_role: targetRole,
        })
        setGithubResult(data as GitHubResult)
        toast.success('GitHub analysis complete')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Analysis failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const currentResult =
    activePanel === 'linkedin'
      ? linkedinResult
      : activePanel === 'portfolio'
        ? portfolioResult
        : githubResult

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pro Tools</h1>
            <p className="mt-1 text-muted-foreground">
              AI-powered reviews for LinkedIn, portfolio, and GitHub profiles.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Panel selector */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PANELS.map((panel) => (
          <motion.button
            key={panel.key}
            type="button"
            whileHover={{ y: -2 }}
            onClick={() => {
              setActivePanel(panel.key)
              setError(null)
            }}
            className={cn(
              'rounded-2xl border bg-gradient-to-br p-5 text-left transition',
              panel.color,
              activePanel === panel.key
                ? 'ring-2 ring-primary/50'
                : 'opacity-80 hover:opacity-100',
            )}
          >
            <panel.icon className="mb-3 h-6 w-6" />
            <p className="font-semibold">{panel.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{panel.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card className="border-border/80 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">
              {PANELS.find((p) => p.key === activePanel)?.title}
            </CardTitle>
            <CardDescription>Paste your profile content for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              {activePanel === 'linkedin' && (
                <motion.div
                  key="linkedin-form"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="target-role">Target role</Label>
                    <Input
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-content">Profile content</Label>
                    <Textarea
                      id="linkedin-content"
                      value={linkedinContent}
                      onChange={(e) => setLinkedinContent(e.target.value)}
                      placeholder="Paste headline, about, experience sections..."
                      className="min-h-[200px]"
                    />
                  </div>
                </motion.div>
              )}
              {activePanel === 'portfolio' && (
                <motion.div
                  key="portfolio-form"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="career-path">Career path</Label>
                    <Input
                      id="career-path"
                      value={careerPath}
                      onChange={(e) => setCareerPath(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio-content">Portfolio content</Label>
                    <Textarea
                      id="portfolio-content"
                      value={portfolioContent}
                      onChange={(e) => setPortfolioContent(e.target.value)}
                      placeholder="Describe your portfolio site, projects, and layout..."
                      className="min-h-[200px]"
                    />
                  </div>
                </motion.div>
              )}
              {activePanel === 'github' && (
                <motion.div
                  key="github-form"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="github-role">Target role</Label>
                    <Input
                      id="github-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-info">GitHub profile info</Label>
                    <Textarea
                      id="github-info"
                      value={githubInfo}
                      onChange={(e) => setGithubInfo(e.target.value)}
                      placeholder="Username, pinned repos, README snippets, contribution stats..."
                      className="min-h-[200px]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button onClick={runAnalysis} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-border/80 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>Scores and actionable improvements</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  {error}
                </div>
                <Button variant="outline" size="sm" onClick={runAnalysis}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            )}

            {!currentResult && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Run an analysis to see scores and recommendations
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activePanel === 'linkedin' && linkedinResult && (
                <LinkedInResults key="linkedin-results" data={linkedinResult} />
              )}
              {activePanel === 'portfolio' && portfolioResult && (
                <PortfolioResults key="portfolio-results" data={portfolioResult} />
              )}
              {activePanel === 'github' && githubResult && (
                <GitHubResults key="github-results" data={githubResult} />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ScoreHeader({ score, label }: { score?: number; label: string }) {
  if (score == null) return null
  return (
    <div className="mb-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn('text-4xl font-bold', scoreColor(score))}>{score}</p>
      <div className="mx-auto mt-3 max-w-xs">
        <Progress value={score} />
      </div>
    </div>
  )
}

function LinkedInResults({ data }: { data: LinkedInResult }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <ScoreHeader score={data.overall_score} label="Overall score" />
      <div className="space-y-3">
        {data.headline_score != null && <ScoreBar label="Headline" score={data.headline_score} />}
        {data.about_score != null && <ScoreBar label="About" score={data.about_score} />}
        {data.experience_score != null && (
          <ScoreBar label="Experience" score={data.experience_score} />
        )}
      </div>
      {data.strengths && data.strengths.length > 0 && (
        <ResultSection title="Strengths">
          <ul className="space-y-1 text-sm">
            {data.strengths.map((s) => (
              <li key={s} className="text-emerald-400">
                ✓ {s}
              </li>
            ))}
          </ul>
        </ResultSection>
      )}
      {data.improvements && data.improvements.length > 0 && (
        <ResultSection title="Improvements">
          <div className="space-y-3">
            {data.improvements.map((imp) => (
              <div key={imp.section + imp.issue} className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{imp.section}</Badge>
                  <span className="text-xs text-muted-foreground">{imp.issue}</span>
                </div>
                <p className="mt-2 text-sm">{imp.suggestion}</p>
                {imp.rewritten_example && (
                  <p className="mt-2 rounded-lg bg-primary/5 p-2 text-xs italic">
                    "{imp.rewritten_example}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </ResultSection>
      )}
      {data.keyword_recommendations && (
        <div className="flex flex-wrap gap-1.5">
          {data.keyword_recommendations.map((k) => (
            <Badge key={k} variant="secondary">
              {k}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function PortfolioResults({ data }: { data: PortfolioResult }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <ScoreHeader score={data.overall_score} label="Overall score" />
      {data.design_feedback && (
        <FeedbackList title="Design feedback" items={data.design_feedback} />
      )}
      {data.content_feedback && (
        <FeedbackList title="Content feedback" items={data.content_feedback} />
      )}
      {data.missing_elements && (
        <ResultSection title="Missing elements">
          <div className="flex flex-wrap gap-1.5">
            {data.missing_elements.map((el) => (
              <Badge key={el} variant="warning">
                {el}
              </Badge>
            ))}
          </div>
        </ResultSection>
      )}
      {data.improvements && (
        <ResultSection title="Priority improvements">
          <div className="space-y-2">
            {data.improvements.map((imp) => (
              <div
                key={imp.suggestion}
                className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-3 text-sm"
              >
                <Badge variant={imp.priority === 'high' ? 'warning' : 'secondary'}>
                  {imp.priority}
                </Badge>
                <span>{imp.suggestion}</span>
              </div>
            ))}
          </div>
        </ResultSection>
      )}
      {data.standout_tips && (
        <FeedbackList title="Standout tips" items={data.standout_tips} icon="★" />
      )}
    </motion.div>
  )
}

function GitHubResults({ data }: { data: GitHubResult }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <ScoreHeader score={data.overall_score} label="Overall score" />
      {data.summary && (
        <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
      )}
      {data.profile_strengths && (
        <FeedbackList title="Strengths" items={data.profile_strengths} icon="✓" />
      )}
      {data.weaknesses && (
        <FeedbackList title="Weaknesses" items={data.weaknesses} icon="→" />
      )}
      {data.repository_recommendations && (
        <ResultSection title="Repository recommendations">
          <div className="space-y-2">
            {data.repository_recommendations.map((rec) => (
              <div
                key={rec.action}
                className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-3 text-sm"
              >
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{rec.action}</p>
                  <p className="text-xs text-muted-foreground">{rec.why}</p>
                </div>
              </div>
            ))}
          </div>
        </ResultSection>
      )}
      {data.readme_tips && (
        <FeedbackList title="README tips" items={data.readme_tips} />
      )}
      {data.pin_recommendations && (
        <ResultSection title="Pin recommendations">
          <div className="flex flex-wrap gap-1.5">
            {data.pin_recommendations.map((pin) => (
              <Badge key={pin}>{pin}</Badge>
            ))}
          </div>
        </ResultSection>
      )}
    </motion.div>
  )
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  )
}

function FeedbackList({
  title,
  items,
  icon = '•',
}: {
  title: string
  items: string[]
  icon?: string
}) {
  return (
    <ResultSection title={title}>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item} className="text-muted-foreground">
            {icon} {item}
          </li>
        ))}
      </ul>
    </ResultSection>
  )
}
