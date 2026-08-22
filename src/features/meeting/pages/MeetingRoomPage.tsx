import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useUserStore } from '@/store/useUserStore'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { meetingApi } from '@/api/meeting.api'
import { useMeetingStore } from '@/store/useMeetingStore'
import { useChatStore } from '@/store/useChatStore'
import { useWhiteboardStore } from '@/store/useWhiteboardStore'
import { FullPageLoader } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { MeetingTopBar } from '../components/MeetingTopBar'
import { MeetingToolbar } from '../components/MeetingToolbar'
import { VideoGrid } from '../components/VideoGrid'
import { ParticipantsPanel } from '../components/ParticipantsPanel'
import { ChatPanel } from '@/features/chat/components/ChatPanel'
import { WhiteboardPanel } from '@/features/whiteboard/components/WhiteboardPanel'
import { LeaveConfirmDialog } from '../components/LeaveConfirmDialog'

export default function MeetingRoomPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const navigate = useNavigate()
  const isJoining = useMeetingStore((s) => s.isJoining)
  const isInMeeting = useMeetingStore((s) => s.isInMeeting)
  const join = useMeetingStore((s) => s.join)
  const sidebar = useMeetingStore((s) => s.sidebar)
  const whiteboardOpen = useWhiteboardStore((s) => s.isOpen)
  const resetChat = useChatStore((s) => s.reset)

  useEffect(() => {
    if (!meetingId) return
    const current = useMeetingStore.getState()
    if (current.isInMeeting && current.meeting?.id === meetingId) {
      void useChatStore.getState().load(meetingId)
      return
    }

    let cancelled = false
    join(meetingId)
      .then(() => {
        if (!cancelled) void useChatStore.getState().load(meetingId)
      })
      .catch((error: Error) => {
        if (cancelled) return
        toast.error(error.message)
        navigate('/app', { replace: true })
      })
    return () => {
      cancelled = true
    }
  }, [meetingId, join, navigate])

  useEffect(() => {
    if (!meetingId) return

    void meetingApi.heartbeat(meetingId)
    const heartbeat = setInterval(() => {
      void meetingApi.heartbeat(meetingId)
    }, 30_000)

    let unsubscribeRoster = () => {}
    meetingApi
      .subscribeRoster(meetingId, {
        onRosterChange: () => void useMeetingStore.getState().refreshParticipants(),
        onSelfRemoved: () => {
          toast.info('You were removed from this room by the host.')
          useMeetingStore
            .getState()
            .leave()
            .catch(() => {})
            .finally(() => navigate('/app', { replace: true }))
        },
      })
      .then((unsubscribe) => {
        unsubscribeRoster = unsubscribe
      })

    // Broadcast: when anyone (host or auto-disband) ends the room, everyone leaves.
    let unsubscribeRoom = () => {}
    meetingApi
      .subscribeRoom(meetingId, {
        onUpdated: (updated) => {
          const store = useMeetingStore.getState()
          if (store.meeting?.id === updated.id) store.setMeeting(updated)
          if (updated.status === 'ended' && store.isInMeeting) {
            toast.info('This class was disbanded by the host.')
            store
              .leave()
              .catch(() => {})
              .finally(() => navigate('/app', { replace: true }))
          }
        },
      })
      .then((unsubscribe) => {
        unsubscribeRoom = unsubscribe
      })

    return () => {
      clearInterval(heartbeat)
      unsubscribeRoster()
      unsubscribeRoom()
    }
  }, [meetingId, navigate])

  // Auto-disband: host alone (roster < 2) for 5 straight minutes ends the class.
  const participantCount = useMeetingStore((s) => s.participants.length)
  const meetingStatus = useMeetingStore((s) => s.meeting?.status)
  const meetingHostId = useMeetingStore((s) => s.meeting?.hostId)
  const myUserId = useUserStore((s) => s.user?.id)

  useEffect(() => {
    const m = useMeetingStore.getState().meeting
    if (!meetingId || !isInMeeting || !m || !myUserId) return
    if (m.hostId !== myUserId || m.status !== 'live') return

    let timer: number | undefined
    if (participantCount < 2) {
      timer = window.setTimeout(() => {
        const current = useMeetingStore.getState()
        if (!current.isInMeeting || (current.participants.length >= 2)) return
        void meetingApi
          .endRoom(meetingId)
          .then(() => {
            toast.info('Class disbanded — it was empty (just you) for over 5 minutes.')
            return current.leave()
          })
          .catch(() => {})
          .finally(() => navigate('/app', { replace: true }))
      }, 5 * 60 * 1000)
    }
    return () => {
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [participantCount, isInMeeting, meetingStatus, meetingHostId, myUserId, meetingId, navigate])

  useEffect(() => {
    return () => {
      resetChat()
      useWhiteboardStore.getState().close()
    }
  }, [resetChat])

  if (!meetingId || isJoining) {
    return <FullPageLoader label="Joining the room…" />
  }

  if (!isInMeeting) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState title="You're not in this room yet" onRetry={() => void join(meetingId)} />
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <MeetingTopBar />

      <div className="relative flex min-h-0 flex-1">
        {/* Primary stage: whiteboard becomes the workspace, videos float */}
        <div className="relative min-w-0 flex-1">
          {whiteboardOpen ? <WhiteboardPanel /> : <VideoGrid />}
        </div>

        {/* Collapsible right panel: chat / participants.
            On mobile it overlays the stage; on sm+ it docks in-flow. */}
        <AnimatePresence initial={false}>
          {sidebar && (
            <>
              <motion.div
                key={`${sidebar}-scrim`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-10 bg-black/40 sm:hidden"
                onClick={() => useMeetingStore.getState().setSidebar(null)}
              />
              <motion.aside
                key={sidebar}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-y-0 right-0 z-20 h-full w-full max-w-sm shrink-0 overflow-hidden border-l border-border bg-card shadow-xl sm:relative sm:w-80 sm:shadow-none lg:w-96"
                aria-label={sidebar === 'chat' ? 'Meeting chat' : 'Participants'}
              >
                <div className="h-full w-full">
                  {sidebar === 'chat' && <ChatPanel meetingId={meetingId} />}
                  {sidebar === 'participants' && <ParticipantsPanel />}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <MeetingToolbar />
      <LeaveConfirmDialog />
    </div>
  )
}