import { motion } from 'framer-motion'
import {
  Hand,
  MessagesSquare,
  MonitorUp,
  PenLine,
  PhoneOff,
  Settings2,
  Users,
  Video,
  VideoOff,
  Mic,
  MicOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { useMeetingStore } from '@/store/useMeetingStore'
import { useWhiteboardStore } from '@/store/useWhiteboardStore'
import { useUIStore } from '@/store/useUIStore'
import { useUnreadCount } from '@/store/useChatStore'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface ControlButtonProps {
  label: string
  shortcut?: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
  children: React.ReactNode
}

function ControlButton({
  label,
  shortcut,
  onClick,
  children,
  className,
  active,
  disabled,
}: ControlButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          className={cn(
            'group relative flex h-9 w-9 items-center justify-center rounded-md text-secondary-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:h-10 sm:w-10',
            className,
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {label}
        {shortcut && <span className="ml-1.5 text-[10px] opacity-60">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

export function MeetingToolbar() {
  const {
    micEnabled,
    cameraEnabled,
    screenSharing,
    handRaised,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    toggleHand,
  } = useMeetingStore()
  const setSidebar = useMeetingStore((s) => s.setSidebar)
  const sidebar = useMeetingStore((s) => s.sidebar)
  const whiteboard = useWhiteboardStore()
  const openDialog = useUIStore((s) => s.openDialog)
  const unread = useUnreadCount()
  const meeting = useMeetingStore((s) => s.meeting)

  const toggleWhiteboard = () => {
    if (whiteboard.isOpen) {
      whiteboard.close()
    } else {
      void whiteboard.open(meeting?.id ?? 'm-1')
    }
  }

  return (
    <motion.footer
      initial={{ y: 32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 flex h-14 shrink-0 items-center justify-center gap-1 border-t border-border bg-card px-2 sm:h-16 sm:gap-1.5 sm:px-3"
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <ControlButton
          label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
          shortcut="⌘D"
          active={!micEnabled}
          onClick={() => {
            toggleMic()
            toast(micEnabled ? 'Microphone muted' : 'Microphone unmuted', { duration: 1200 })
          }}
          className={cn(
            micEnabled
              ? 'bg-secondary text-foreground hover:bg-accent'
              : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          )}
        >
          {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </ControlButton>

        <ControlButton
          label={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
          shortcut="⌘E"
          active={!cameraEnabled}
          onClick={() => {
            toggleCamera()
            toast(cameraEnabled ? 'Camera off' : 'Camera on', { duration: 1200 })
          }}
          className={cn(
            cameraEnabled
              ? 'bg-secondary text-foreground hover:bg-accent'
              : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          )}
        >
          {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </ControlButton>

        <ControlButton
          label={screenSharing ? 'Stop sharing screen' : 'Share screen'}
          shortcut="⌘S"
          active={screenSharing}
          onClick={() => {
            toggleScreenShare()
            toast(screenSharing ? 'Screen sharing stopped' : 'Sharing your screen', {
              duration: 1500,
            })
          }}
          className={cn(
            screenSharing
              ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
              : 'bg-secondary text-foreground hover:bg-accent',
          )}
        >
          <MonitorUp className="h-4 w-4" />
        </ControlButton>

        <ControlButton
          label={whiteboard.isOpen ? 'Close whiteboard' : 'Open whiteboard'}
          shortcut="⌘W"
          active={whiteboard.isOpen}
          onClick={toggleWhiteboard}
          className={cn(
            whiteboard.isOpen
              ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
              : 'bg-secondary text-foreground hover:bg-accent',
          )}
        >
          <PenLine className="h-4 w-4" />
        </ControlButton>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />

      <div className="flex items-center gap-1 sm:gap-2">
        <ControlButton
          label={handRaised ? 'Lower hand' : 'Raise hand'}
          shortcut="⌘H"
          active={handRaised}
          onClick={() => {
            toggleHand()
            toast(handRaised ? 'You lowered your hand' : 'You raised your hand', {
              duration: 1500,
            })
          }}
          className={cn(
            handRaised
              ? 'bg-warning text-warning-foreground hover:bg-warning/90'
              : 'bg-secondary text-foreground hover:bg-accent',
          )}
        >
          <Hand className="h-4 w-4" />
        </ControlButton>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setSidebar('chat')}
              aria-pressed={sidebar === 'chat'}
              aria-label="Toggle chat"
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:w-10',
                sidebar === 'chat'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-accent',
              )}
            >
              <MessagesSquare className="h-4 w-4" />
              {unread > 0 && sidebar !== 'chat' && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
                >
                  {unread}
                </Badge>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Chat · ⌘C</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setSidebar('participants')}
              aria-pressed={sidebar === 'participants'}
              aria-label="Toggle participants"
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:w-10',
                sidebar === 'participants'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-accent',
              )}
            >
              <Users className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Participants · ⌘P</TooltipContent>
        </Tooltip>

        <ControlButton
          label="Settings"
          shortcut="⌘,"
          onClick={() => openDialog('settings')}
          className="hidden bg-secondary text-foreground hover:bg-accent sm:flex"
        >
          <Settings2 className="h-4 w-4" />
        </ControlButton>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />

      <ControlButton
        label="Leave meeting"
        shortcut="⌘X"
        onClick={() => openDialog('leave-confirm')}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        <PhoneOff className="h-4 w-4" />
      </ControlButton>
    </motion.footer>
  )
}