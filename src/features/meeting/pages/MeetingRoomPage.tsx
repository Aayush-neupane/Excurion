import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
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
    if (useMeetingStore.getState().isInMeeting) {
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

        {/* Collapsible right panel: chat / participants */}
        <AnimatePresence initial={false}>
          {sidebar && (
            <motion.aside
              key={sidebar}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-20 h-full shrink-0 overflow-hidden border-l border-border bg-card"
              aria-label={sidebar === 'chat' ? 'Meeting chat' : 'Participants'}
            >
              <div className="h-full w-[min(88vw,24rem)] sm:w-80 lg:w-96">
                {sidebar === 'chat' && <ChatPanel meetingId={meetingId} />}
                {sidebar === 'participants' && <ParticipantsPanel />}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <MeetingToolbar />
      <LeaveConfirmDialog />
    </div>
  )
}