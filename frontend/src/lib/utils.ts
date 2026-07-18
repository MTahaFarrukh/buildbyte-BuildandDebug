import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-cyan-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-rose-400'
}

export function scoreBg(score: number) {
  if (score >= 80) return 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30'
  if (score >= 60) return 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30'
  if (score >= 40) return 'from-amber-500/20 to-amber-500/5 border-amber-500/30'
  return 'from-rose-500/20 to-rose-500/5 border-rose-500/30'
}
