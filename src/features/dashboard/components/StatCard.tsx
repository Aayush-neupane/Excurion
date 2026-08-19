import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SkeletonBlock } from '@/components/common/SkeletonBlocks'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  iconClassName?: string
  trend?: 'up' | 'down' | 'neutral'
  children?: ReactNode
}

export function StatCard({ label, value, hint, icon: Icon, iconClassName, children }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/40"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 transition-colors',
            iconClassName,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {children}
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="mt-2 h-7 w-16" />
      <SkeletonBlock className="mt-1 h-3 w-32" />
    </div>
  )
}