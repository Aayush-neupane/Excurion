import { motion } from 'framer-motion'
import { CalendarClock, Video } from 'lucide-react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import type { Meeting } from '@/types/meeting'
import { meetingApi } from '@/api'
import { useCountdown } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { CardRowSkeleton } from '@/components/common/SkeletonBlocks'
import { ErrorState } from '@/components/common/ErrorState'
import { formatTime } from '@/lib/utils'

const TYPE_LABELS: Record<Meeting['type'], string> = {
  class: 'Class',
  '1on1': '1:1',
  webinar: 'Webinar',
  'office-hours': 'Office hours',
}

function UpcomingRow({ meeting }: { meeting: Meeting }) {
  const { days, hours, minutes, isExpired } = useCountdown(meeting.scheduledAt ?? null)
  if (isExpired || !meeting.scheduledAt) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40"
    >
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-muted/50">
        <CalendarClock className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{meeting.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {new Date(meeting.scheduledAt).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}{' '}
          at {formatTime(meeting.scheduledAt)}
          {' · '}
          {days > 0 ? `${days}d ` : ''}
          {hours > 0 ? `${hours}h ` : ''}
          {minutes}m left
        </p>
      </div>
      <Badge variant="secondary" className="hidden sm:inline-flex">
        {TYPE_LABELS[meeting.type]}
      </Badge>
      <Button size="sm" variant="outline" asChild className="shrink-0">
        <Link to={`/meeting/${meeting.id}`}>
          <Video className="h-3.5 w-3.5" />
          Join
        </Link>
      </Button>
    </motion.div>
  )
}

export function UpcomingMeetings() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['meetings', 'upcoming'],
    queryFn: meetingApi.getUpcoming,
  })

  if (isLoading) return <CardRowSkeleton rows={3} />
  if (isError)
    return (
      <ErrorState title="Could not load upcoming meetings" onRetry={() => void refetch()} />
    )

  const upcoming = (data ?? []).slice(0, 4)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm">Upcoming meetings</CardTitle>
        <Badge variant="outline" className="text-xs">
          {upcoming.length} scheduled
        </Badge>
      </CardHeader>
      <CardContent className="space-y-1">
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nothing scheduled yet"
            description="Your upcoming classes and office hours will appear here."
          />
        ) : (
          upcoming.map((meeting) => <UpcomingRow key={meeting.id} meeting={meeting} />)
        )}
      </CardContent>
    </Card>
  )
}