import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Settings,
  Loader2,
  Moon,
  Sun,
  Bell,
  BellOff,
  Save,
  Trash2,
  AlertTriangle,
  User,
  Share2,
  GitBranch,
  Globe,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import { dashboardApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
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
  'Software Engineer',
]

export default function SettingsPage() {
  const { user, logout, updateLocalProfile, refreshProfile } = useAuth()
  const { theme, toggleTheme, setTheme } = useTheme()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [careerPath, setCareerPath] = useState('')
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setFullName(user.full_name || '')
    setCareerPath(user.career_path || 'Software Engineer')
    setBio(user.bio || '')
    setLinkedinUrl(user.linkedin_url || '')
    setGithubUrl(user.github_url || '')
    setPortfolioUrl(user.portfolio_url || '')
    setNotifications(user.notifications_enabled !== false)
    if (user.theme === 'light' || user.theme === 'dark') {
      setTheme(user.theme)
    }
  }, [user, setTheme])

  const saveProfile = async () => {
    if (!user?.id) return
    setSaving(true)
    setError(null)
    try {
      await dashboardApi.updateProfile(user.id, {
        full_name: fullName,
        career_path: careerPath,
        bio,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        notifications_enabled: notifications,
        theme,
      })
      updateLocalProfile({
        full_name: fullName,
        career_path: careerPath,
        bio,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        notifications_enabled: notifications,
        theme,
      })
      await refreshProfile()
      toast.success('Profile saved!')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save profile'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!user?.id || !confirmDelete) return
    setDeleting(true)
    setError(null)
    try {
      await dashboardApi.deleteAccount(user.id)
      logout()
      navigate('/')
      toast.success('Account deleted')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete account'
      setError(msg)
      toast.error(msg)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-foreground">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your profile, preferences, and account.
            </p>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          {error}
        </div>
      )}

      {/* Appearance */}
      <Card className="border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Customize how CareerGPS looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400" />
              )}
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground capitalize">{theme} mode</p>
              </div>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => setNotifications(!notifications)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/20 p-4 transition hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              {notifications ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium">Email & activity reminders</p>
                <p className="text-xs text-muted-foreground">
                  {notifications ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div
              className={cn(
                'relative h-6 w-11 rounded-full transition',
                notifications ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition',
                  notifications ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
          <CardDescription>Your public career identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell mentors and recruiters about yourself..."
              className="min-h-[100px]"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/you"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                GitHub URL
              </Label>
              <Input
                id="github"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/you"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Portfolio URL
              </Label>
              <Input
                id="portfolio"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.dev"
              />
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save profile
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resume note */}
      <Card className="border-border/80 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Resume management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Upload, analyze, and rewrite your resume from the{' '}
            <a href="/app/resume" className="font-medium text-primary hover:underline">
              Resume AI
            </a>{' '}
            page. Your latest resume analysis contributes to your career score and analytics
            dashboard. Resume files are stored securely in your account profile.
          </p>
        </CardContent>
      </Card>

      {/* Delete account */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!confirmDelete ? (
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete account
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
            >
              <p className="text-sm">
                Are you sure? This will permanently delete your profile, chat history, and all
                career data. This action cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" onClick={deleteAccount} disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, delete my account'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
