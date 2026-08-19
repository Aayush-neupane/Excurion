import { motion } from 'framer-motion'
import { Clock, PlayCircle, Users, Video } from 'lucide-react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import type { Meeting } from '@/types/meeting'
import { meetingApi } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { CardRowSkeleton } from '@/components/common/SkeletonBlocks'
import { ErrorState } from '@/components/common/ErrorState'
import { formatDayMonth, formatDuration } from '@/lib/utils'

function RecentRow({ meeting }: { meeting: Meeting }) {
  const isLive = meeting.status === 'live'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40"
    >
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-muted/50">
        {isLive ? (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
          </span>
        ) : (
          <PlayCircle className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{meeting.title}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {meeting.participants}
          </span>
          {meeting.endedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDayMonth(meeting.endedAt)}
            </span>
          )}
          {meeting.duration && (
            <span>{formatDuration(meeting.duration * 60)}</span>
          )}
        </p>
      </div>
      {isLive ? (
        <Badge variant="destructive" className="shrink-0 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden />
          Live
        </Badge>
      ) : (
        meeting.recordingUrl && <Badge variant="success">Recording</Badge>
      )}
      <Button
        size="sm"
        variant={isLive ? 'default' : 'outline'}
        asChild
        className="shrink-0"
      >
        <Link to={`/meeting/${meeting.id}`}>
          <Video className="h-3.5 w-3.5" />
          {isLive ? 'Join' : 'Open'}
        </Link>
      </Button>
    </motion.div>
  )
}

export function RecentClasses() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['meetings', 'recent'],
    queryFn: meetingApi.getRecent,
  })

  if (isLoading) return <CardRowSkeleton rows={3} />
  if (isError)
    return <ErrorState title="Could not load recent classes" onRetry={() => void refetch()} />

  const meetings = [
    ...(data ?? []).filter((m) => m.status === 'live'),
    ...(data ?? []).filter((m) => m.status !== 'live'),
  ]

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm">Recent classes</CardTitle>
        <Badge variant="outline" className="text-xs">
          {meetings.length} total
        </Badge>
      </CardHeader>
      <CardContent className="space-y-1">
        {meetings.length === 0 ? (
          <EmptyState
            icon={Video}
            title="No classes yet"
            description="Create your first room and jump right in."
          />
        ) : (
          meetings.map((meeting) => <RecentRow key={meeting.id} meeting={meeting} />)
        )}
      </CardContent>
    </Card>
  )
}