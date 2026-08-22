import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Check, Copy, PhoneOff, Projector, Radio, Wifi, WifiOff, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useStopwatch, useOnlineStatus } from '@/hooks'
import { formatDuration } from '@/lib/utils'
import { meetingApi } from '@/api'
import { useUIStore } from '@/store/useUIStore'
import { useMeetingStore } from '@/store/useMeetingStore'
import { useUserStore } from '@/store/useUserStore'
import { useWhiteboardStore } from '@/store/useWhiteboardStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function MeetingTopBar() {
  const meeting = useMeetingStore((s) => s.meeting)
  const openDialog = useUIStore((s) => s.openDialog)
  const isOnline = useOnlineStatus()
  const elapsed = useStopwatch(true)
  const whiteboardOpen = useWhiteboardStore((s) => s.isOpen)
  const [copied, setCopied] = useState(false)
  const [disbandOpen, setDisbandOpen] = useState(false)
  const navigate = useNavigate()
  const myUserId = useUserStore((s) => s.user?.id)
  const isHost = !!meeting && meeting.hostId === myUserId

  const disband = useMutation({
    mutationFn: () => meetingApi.endRoom(meeting!.id),
    onSuccess: () => {
      setDisbandOpen(false)
      toast.success('Class disbanded. Everyone has been asked to leave.')
      navigate('/app', { replace: true })
    },
    onError: (error: Error) => {
      setDisbandOpen(false)
      toast.error(error.message)
    },
  })

  const { data: hostName } = useQuery({
    queryKey: ['meeting-host', meeting?.id],
    queryFn: () => meetingApi.getHostName(meeting!.id),
    enabled: !!meeting,
  })

  if (!meeting) return null

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3 sm:px-4"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-tight">{meeting.title}</h1>
          <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
            Hosted by {hostName} · code {meeting.roomCode}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div
          className={cn(
            'hidden items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium md:flex',
            isOnline
              ? 'border-success/25 bg-success/10 text-success'
              : 'border-destructive/25 bg-destructive/10 text-destructive',
          )}
          title={isOnline ? 'Connected' : 'Offline'}
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isOnline ? 'Connected' : 'Offline'}
        </div>

        <div
          className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1 font-mono text-xs tabular-nums text-muted-foreground"
          aria-label="Meeting duration"
        >
          <Radio className="h-3 w-3 text-destructive" aria-hidden />
          {formatDuration(elapsed)}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden h-7 gap-1.5 px-2.5 text-xs font-mono sm:flex"
            >
              <Projector className="h-3 w-3" />
              {meeting.roomCode}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4">
            <div>
              <p className="text-sm font-semibold">Invite participants</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this code — anyone can join immediately.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-center font-mono text-sm tracking-wider">
                {meeting.roomCode}
              </code>
              <Button
                size="icon"
                variant="outline"
                aria-label="Copy room code"
                onClick={() => {
                  void navigator.clipboard.writeText(meeting.roomCode)
                  setCopied(true)
                  toast.success('Room code copied to clipboard')
                  setTimeout(() => setCopied(false), 1500)
                }}
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {whiteboardOpen && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                <Projector className="h-3.5 w-3.5" />
                Whiteboard is the main stage — videos are floating.
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        {isHost && meeting.status === 'live' && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDisbandOpen(true)}
          >
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Disband</span>
          </Button>
        )}

        <Button
          variant="destructive"
          size="sm"
          className="gap-1.5"
          onClick={() => openDialog('leave-confirm')}
        >
          <PhoneOff className="h-4 w-4" />
          <span className="hidden sm:inline">Leave</span>
        </Button>
      </div>

      <Dialog open={disbandOpen} onOpenChange={setDisbandOpen}>
        <DialogContent className="sm:max-w-sm" aria-describedby="disband-desc">
          <DialogHeader>
            <DialogTitle>Disband this class?</DialogTitle>
            <DialogDescription id="disband-desc">
              The room ends immediately for everyone, including you. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDisbandOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={disband.isPending}
              onClick={() => disband.mutate()}
            >
              {disband.isPending ? 'Disbanding…' : 'Disband class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.header>
  )
}