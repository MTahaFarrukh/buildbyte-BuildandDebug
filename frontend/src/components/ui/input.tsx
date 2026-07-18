import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[120px] w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
      className,
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('text-sm font-medium text-foreground/90', className)} {...props} />
)

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'accent' | 'outline' | 'success' | 'warning'
}) => {
  const styles = {
    default: 'bg-primary/15 text-primary border-primary/20',
    secondary: 'bg-secondary/15 text-secondary border-secondary/20',
    accent: 'bg-accent/15 text-accent border-accent/20',
    outline: 'bg-transparent text-foreground border-border',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className,
      )}
      {...props}
    />
  )
}
