import { Link } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ACHIEVEMENT_DEFS } from '@/lib/careerEngine'
import { useWorkspace } from '@/store/workspace'
import { cn } from '@/lib/utils'

export function RecommendationBanner({ className }: { className?: string }) {
  const recs = useWorkspace((s) => s.getRecommendations())
  const top = recs[0]
  if (!top) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 px-4 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20">
          <Compass className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Next best action
          </p>
          <p className="font-semibold">{top.title}</p>
          <p className="text-sm text-muted-foreground">{top.reason}</p>
        </div>
      </div>
      <Button asChild size="sm">
        <Link to={top.href}>
          {top.cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  )
}

export function AchievementsRow({ limit = 8 }: { limit?: number }) {
  const unlocked = useWorkspace((s) => s.achievements)
  if (!unlocked.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {unlocked.slice(0, limit).map((id) => {
        const label = ACHIEVEMENT_DEFS.find((a) => a.id === id)?.label || id
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {label}
          </span>
        )
      })}
    </div>
  )
}
