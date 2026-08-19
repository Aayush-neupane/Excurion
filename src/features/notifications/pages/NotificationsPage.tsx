import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Bell,
  BellRing,
  CheckCheck,
  MessageSquare,
  MonitorPlay,
  Radio,
  Siren,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router'
import type { AppNotification, NotificationKind } from '@/types/notification'
import { notificationApi } from '@/api'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const KIND_META: Record<NotificationKind, { icon: LucideIcon; className: string; label: string }> = {
  meeting: { icon: Radio, className: 'bg-primary/15 text-primary', label: 'Meeting' },
  reminder: { icon: Bell, className: 'bg-sky-500/15 text-sky-400', label: 'Reminder' },
  chat: { icon: MessageSquare, className: 'bg-emerald-500/15 text-emerald-400', label: 'Chat' },
  recording: { icon: MonitorPlay, className: 'bg-violet-500/15 text-violet-400', label: 'Recording' },
  system: { icon: BellRing, className: 'bg-muted text-muted-foreground', label: 'System' },
  warning: { icon: Siren, className: 'bg-warning/15 text-warning', label: 'Warning' },
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.list,
  })

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAll = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState title="Could not load notifications" onRetry={() => void refetch()} />
      </div>
    )
  }

  const unread = data.filter((n) => !n.read)
  const read = data.filter((n) => n.read)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Inbox</h2>
          {unread.length > 0 && (
            <Badge variant="default" className="gap-1">
              <Bell className="h-3 w-3" />
              {unread.length} new
            </Badge>
          )}
        </div>
        {unread.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        {data.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up"
            description="New notifications about your classes will appear here."
            className="border-0 shadow-none"
          />
        ) : (
          <ul className="divide-y divide-border" aria-label="Notifications list">
            {[...unread, ...read].map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={() => markRead.mutate(notification.id)}
                isMarking={markRead.isPending && markRead.variables === notification.id}
              />
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}

function NotificationRow({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: AppNotification
  onMarkRead: () => void
  isMarking: boolean
}) {
  const meta = KIND_META[notification.kind]
  const isUnread = !notification.read

  return (
    <li
      className={cn(
        'group relative flex gap-3.5 px-4 py-3.5 transition-colors hover:bg-muted/40',
        isUnread && 'bg-primary/[0.04]',
      )}
    >
      {isUnread && (
        <span className="absolute left-0 top-0 h-full w-0.5 bg-primary" aria-hidden />
      )}
      <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.className)}>
        <meta.icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn('text-sm', isUnread ? 'font-semibold' : 'font-medium text-foreground/85')}>
              {notification.title}
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
              {notification.body}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground/70">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Badge variant="outline" className="text-[10px]">
            {meta.label}
          </Badge>
          {notification.link && (
            <Button variant="ghost" size="sm" className="-ml-2 h-7 gap-1 text-xs" asChild>
              <Link to={notification.link} onClick={isUnread ? onMarkRead : undefined}>
                <Video className="h-3 w-3" />
                Open
              </Link>
            </Button>
          )}
          {isUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-7 text-xs"
              onClick={onMarkRead}
              disabled={isMarking}
              aria-label={`Mark "${notification.title}" as read`}
            >
              <CheckCheck className="h-3 w-3" />
              Mark read
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}