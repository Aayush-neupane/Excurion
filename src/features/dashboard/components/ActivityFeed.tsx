import { motion } from 'framer-motion'
import {
  MessageSquare,
  MonitorPlay,
  PersonStanding,
  Radio,
  type LucideIcon,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { ActivityItem } from '@/types/meeting'
import { mockActivity } from '@/data/meetings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { CardRowSkeleton } from '@/components/common/SkeletonBlocks'
import { ErrorState } from '@/components/common/ErrorState'
import { formatRelativeTime } from '@/lib/utils'

const ACTIVITY_ICONS: Record<ActivityItem['type'], { icon: LucideIcon; className: string }> = {
  meeting: { icon: Radio, className: 'bg-primary/15 text-primary' },
  chat: { icon: MessageSquare, className: 'bg-sky-500/15 text-sky-400' },
  recording: { icon: MonitorPlay, className: 'bg-emerald-500/15 text-emerald-400' },
  participant: { icon: PersonStanding, className: 'bg-amber-500/15 text-amber-400' },
  system: { icon: Radio, className: 'bg-muted text-muted-foreground' },
}

export function ActivityFeed() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => mockActivity,
    staleTime: 60_000,
  })

  if (isLoading) return <CardRowSkeleton rows={5} />
  if (isError)
    return <ErrorState title="Could not load activity" onRetry={() => void refetch()} />

  const items = data ?? []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {items.length === 0 ? (
          <EmptyState icon={Radio} title="No activity yet" description="What happens in your classrooms will show up here." />
        ) : (
          items.slice(0, 8).map((item, i) => {
            const meta = ACTIVITY_ICONS[item.type]
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40"
              >
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
                  <meta.icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-foreground/90">{item.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}