import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Map,
  Rocket,
  MessageSquare,
  Target,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  Share2,
  GitBranch,
  Globe,
  X,
  History,
  Library,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/resume', icon: FileText, label: 'Resume AI' },
  { to: '/app/job-prep', icon: Briefcase, label: 'Job Prep Copilot' },
  { to: '/app/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/app/projects', icon: Rocket, label: 'Projects' },
  { to: '/app/skills', icon: Target, label: 'Skill Gap' },
  { to: '/app/planner', icon: Calendar, label: 'Learning Plan' },
  { to: '/app/chat', icon: MessageSquare, label: 'AI Mentor' },
  { to: '/app/timeline', icon: History, label: 'Timeline' },
  { to: '/app/library', icon: Library, label: 'PDF Library' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/tools', icon: Sparkles, label: 'Pro Tools' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { user } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">CareerGPS</p>
              <p className="text-[10px] text-muted-foreground">AI Career Mentor</p>
            </div>
          </div>
          <button className="rounded-lg p-1.5 hover:bg-muted lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 p-4">
            <p className="text-xs font-semibold">{user?.full_name || 'Explorer'}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {user?.career_path || 'Set your path'}
            </p>
            <div className="mt-3 flex items-center gap-2 text-muted-foreground">
              <Share2 className="h-3.5 w-3.5" />
              <GitBranch className="h-3.5 w-3.5" />
              <Globe className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
