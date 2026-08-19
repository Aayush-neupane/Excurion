import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { meetingApi } from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function AttendanceChart() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['statistics'],
    queryFn: meetingApi.getStatistics,
  })

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />
  if (isError || !data)
    return (
      <ErrorState
        title="Could not load statistics"
        onRetry={() => void refetch()}
        className="h-64"
      />
    )

  const max = Math.max(...data.weeklyAttendance.map((d) => d.rate))
  const avg =
    Math.round((data.weeklyAttendance.reduce((sum, d) => sum + d.rate, 0) / data.weeklyAttendance.length) * 10) / 10

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="text-sm">This week</CardTitle>
            <CardDescription>Attendance rate per day</CardDescription>
          </div>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
            {avg}% avg
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-2 sm:gap-3" role="img" aria-label={`Weekly attendance: ${data.weeklyAttendance.map((d) => `${d.day} ${d.rate}%`).join(', ')}`}>
            {data.weeklyAttendance.map((d, i) => (
              <Tooltip key={d.day}>
                <TooltipTrigger asChild>
                  <div className="group flex h-full flex-1 flex-col justify-end gap-1.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(8, (d.rate / max) * 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full rounded-md bg-primary/80 transition-colors group-hover:bg-primary"
                    />
                    <span className="text-center text-[11px] font-medium text-muted-foreground">
                      {d.day}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {d.day}: {d.rate}% attendance
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Best day</p>
              <p className="text-sm font-semibold">
                {data.weeklyAttendance.reduce((best, d) => (d.rate > best.rate ? d : best)).day} ·{' '}
                {max}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Classes this week</p>
              <p className="text-sm font-semibold">
                {data.weeklyActivity.reduce((sum, d) => sum + d.classes, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}