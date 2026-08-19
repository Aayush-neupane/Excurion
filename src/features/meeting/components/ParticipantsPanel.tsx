import { motion } from 'framer-motion'
import { Hand, Mic, MicOff, Video, VideoOff, Crown, X } from 'lucide-react'
import type { Participant } from '@/types/meeting'
import { useMeetingStore } from '@/store/useMeetingStore'
import { useUserStore } from '@/store/useUserStore'
import { useSimulatedSpeakers } from '@/hooks'
import { UserAvatar } from '@/components/common/UserAvatar'
import { ConnectionBadge } from '@/components/common/ConnectionBadge'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

export function ParticipantsPanel() {
  const participants = useMeetingStore((s) => s.participants)
  const setSidebar = useMeetingStore((s) => s.setSidebar)
  const setParticipants = useMeetingStore((s) => s.setParticipants)
  const setSidebarNull = () => setSidebar(null)

  const speakerIds = participants.filter((p) => p.id !== 'p-self').map((p) => p.id)
  const simulated = useSimulatedSpeakers(speakerIds)

  const host = participants.find((p) => p.isHost)
  const others = participants.filter((p) => !p.isHost)
  const raisedHands = participants.filter((p) => p.raisedHand)
  const meeting = useMeetingStore((s) => s.meeting)
  const userId = useUserStore((s) => s.user?.id)
  const isHost = userId === meeting?.hostId

  const lowerHand = (participantId: string) => {
    setParticipants(
      participants.map((p) =>
        p.id === participantId ? { ...p, raisedHand: false } : p,
      ),
    )
  }

  return (
    <section className="flex h-full flex-col" aria-label="Participants">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-semibold">
          Participants{' '}
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {participants.length}
          </Badge>
        </h2>
        <Button
          variant="ghost"
          size="iconSm"
          onClick={setSidebarNull}
          aria-label="Close participants panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      {raisedHands.length > 0 && (
        <div className="shrink-0 border-b border-border bg-warning/10 px-4 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
            <Hand className="h-3.5 w-3.5" />
            {raisedHands.length} hand{raisedHands.length > 1 ? 's' : ''} raised
          </p>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {host && (
            <>
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Host
              </p>
              <ParticipantRow participant={host} isSelf={host.id === 'p-self'} simulatedSpeaking={simulated.has(host.id)} />
            </>
          )}
          <p className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Participants {others.length}
          </p>
          {others.map((p, i) => (
            <ParticipantRow
              key={p.id}
              participant={p}
              index={i}
              isSelf={p.id === 'p-self'}
              simulatedSpeaking={simulated.has(p.id)}
              onLowerHand={isHost ? () => lowerHand(p.id) : undefined}
            />
          ))}
          {others.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No one else has joined yet — share the room code!
            </p>
          )}
        </div>
      </ScrollArea>
    </section>
  )
}

function ParticipantRow({
  participant,
  isSelf,
  simulatedSpeaking,
  index = 0,
  onLowerHand,
}: {
  participant: Participant
  isSelf: boolean
  simulatedSpeaking: boolean
  index?: number
  onLowerHand?: () => void
}) {
  const p = participant

  const speaking = p.speaking || (p.id !== 'p-self' && simulatedSpeaking)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40',
        speaking && 'bg-primary/5',
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar name={p.name} className="h-9 w-9" />
        {speaking && (
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-success"
            aria-label="Speaking"
          />
        )}
        {p.raisedHand && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-warning-foreground shadow-sm"
            aria-label="Hand raised"
          >
            <Hand className="h-3 w-3" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">
          {isSelf ? `${p.name.replace(' (You)', '')} (You)` : p.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          {p.isHost && <Crown className="h-3 w-3 text-warning" aria-label="Host" />}
          <ConnectionBadge quality={p.connection} compact />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {p.raisedHand && onLowerHand && (
          <button
            onClick={onLowerHand}
            className="rounded-md bg-warning/15 p-1.5 text-warning transition-colors hover:bg-warning/25"
            aria-label={`Lower ${p.name}'s hand`}
            title="Lower hand"
          >
            <Hand className="h-3.5 w-3.5" />
          </button>
        )}
        <span title={p.mic === 'on' ? 'Microphone on' : 'Microphone muted'} className="rounded-md p-1.5 text-muted-foreground">
          {p.mic === 'on' ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5 text-destructive" />}
        </span>
        <span title={p.camera === 'on' ? 'Camera on' : 'Camera off'} className="rounded-md p-1.5 text-muted-foreground">
          {p.camera === 'on' ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5 text-destructive" />}
        </span>
      </div>
    </motion.div>
  )
}