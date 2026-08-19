import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Clock,
  Plus,
  Ticket,
  Trophy,
  UserPlus,
  Video,
} from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { useUIStore } from '@/store/useUIStore'
import { meetingApi } from '@/api'
import { Button } from '@/components/ui/button'
import { StatCard, StatCardSkeleton } from '../components/StatCard'
import { AttendanceChart } from '../components/AttendanceChart'
import { UpcomingMeetings } from '../components/UpcomingMeetings'
import { RecentClasses } from '../components/RecentClasses'
import { ActivityFeed } from '../components/ActivityFeed'
import { CreateRoomDialog } from '@/features/meeting/components/CreateRoomDialog'
import { JoinRoomDialog } from '@/features/meeting/components/JoinRoomDialog'

function Greeting() {
  const user = useUserStore((s) => s.user)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold tracking-tight"
      >
        {greeting}, {user?.name.split(' ')[0]}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-sm text-muted-foreground"
      >
        Ready to inspire your students today?
      </motion.p>
    </div>
  )
}

function QuickActions() {
  const { openDialog } = useUIStore()
  const actions = [
    { id: 'create-room' as const, label: 'Create room', icon: Plus, variant: 'default' as const },
    { id: 'join-room' as const, label: 'Join room', icon: Ticket, variant: 'outline' as const },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant}
          size="sm"
          onClick={() => openDialog(action.id)}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  )
}

function StatsGrid() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['statistics'],
    queryFn: meetingApi.getStatistics,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} label="—" value="—" icon={Video} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Classes taught"
        value={String(data.totalClasses)}
        hint="lifetime"
        icon={BookOpen}
        iconClassName="bg-primary/15 text-primary"
      />
      <StatCard
        label="Minutes live"
        value={Math.round(data.totalMinutes / 60).toLocaleString()}
        hint={`≈ ${Math.round(data.totalMinutes / 60 / data.totalClasses)}h per class`}
        icon={Clock}
        iconClassName="bg-sky-500/15 text-sky-400"
      />
      <StatCard
        label="Students"
        value={String(data.totalStudents)}
        hint="across all rooms"
        icon={UserPlus}
        iconClassName="bg-emerald-500/15 text-emerald-400"
      />
      <StatCard
        label="Attendance"
        value={`${data.attendanceRate}%`}
        hint="this term"
        icon={Trophy}
        iconClassName="bg-amber-500/15 text-amber-400"
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Greeting />
        <QuickActions />
      </div>

      <StatsGrid />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AttendanceChart />
          <RecentClasses />
        </div>
        <div className="space-y-6">
          <UpcomingMeetings />
          <ActivityFeed />
        </div>
      </div>

      <CreateRoomDialog />
      <JoinRoomDialog />
    </div>
  )
}