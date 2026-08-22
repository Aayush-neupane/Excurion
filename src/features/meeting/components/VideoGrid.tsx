import { motion } from 'framer-motion'
import {
  MonitorUp,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Wifi,
} from 'lucide-react'
import type { Participant } from '@/types/meeting'
import { useMeetingStore } from '@/store/useMeetingStore'
import { useUserStore } from '@/store/useUserStore'
import { useSimulatedSpeakers } from '@/hooks'
import { UserAvatar } from '@/components/common/UserAvatar'
import { cn, initials } from '@/lib/utils'

export function VideoTile({ participant, index }: { participant: Participant; index: number }) {
  const myUserId = useUserStore((s) => s.user?.id)
  const isSelf = participant.userId !== undefined && participant.userId === myUserId
  const selfCamera = useMeetingStore((s) => s.cameraEnabled)
  const cameraOff = isSelf ? !selfCamera : participant.camera === 'off'
  const micEnabled = isSelf ? useMeetingStore.getState().micEnabled : participant.mic === 'on'
  const micLive = useMeetingStore((s) => s.micEnabled)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative aspect-video overflow-hidden rounded-lg border bg-card transition-colors',
        participant.speaking ? 'border-primary ring-1 ring-primary/40' : 'border-border',
      )}
      role="group"
      aria-label={`${participant.name}, ${cameraOff ? 'camera off' : 'camera on'}, ${micEnabled ? 'microphone on' : 'microphone muted'}`}
    >
      {cameraOff ? (
        <div className="flex h-full items-center justify-center">
          <UserAvatar name={participant.name} src={participant.avatarUrl} className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden">
          <SimulatedVideo name={participant.name} src={participant.avatarUrl} />
          {isSelf && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
              You
            </span>
          )}
        </div>
      )}

      {participant.speaking && (
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary/60" aria-hidden />
      )}

      {participant.raisedHand && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-warning/90 text-warning-foreground shadow-sm"
          aria-label={`${participant.name} raised their hand`}
        >
          <Hand className="h-4 w-4" />
        </motion.div>
      )}

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-2 pb-2.5">
        <div className="flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
          {cameraOff ? (
            <VideoOff className="h-3.5 w-3.5 text-white/70" aria-hidden />
          ) : (
            <Video className="h-3.5 w-3.5 text-white/70" aria-hidden />
          )}
          <span className="max-w-28 truncate font-medium sm:max-w-40">
            {isSelf ? `${participant.name.replace(' (You)', '')} (You)` : participant.name}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {participant.screenShare && (
            <span
              className="flex items-center gap-1 rounded-md bg-primary/80 px-1.5 py-1 text-[10px] font-medium text-primary-foreground"
              title="Sharing screen"
            >
              <MonitorUp className="h-3 w-3" />
              Screen
            </span>
          )}
          {(isSelf ? micLive : micEnabled) ? (
            <Mic className="h-3.5 w-3.5 text-white/80" aria-hidden />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/80">
              <MicOff className="h-3 w-3 text-white" aria-hidden />
            </span>
          )}
        </div>
      </div>

      {(participant.connection === 'fair' || participant.connection === 'poor') && (
        <div className="absolute left-2 top-2">
          <span className="flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-1 text-[10px] text-warning backdrop-blur-sm">
            <Wifi className="h-3 w-3" />
            {participant.connection}
          </span>
        </div>
      )}
    </motion.div>
  )
}

function SimulatedVideo({ name, src }: { name: string; src?: string }) {
  return (
    <>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `linear-gradient(135deg, hsl(${(name.length * 37) % 360} 35% 30%), hsl(${(name.length * 47 + 60) % 360} 30% 22%))`,
        }}
        aria-hidden
      />
      {src ? (
        <img
          src={src}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="relative flex h-full w-full items-center justify-center">
          <span className="text-4xl font-bold tracking-wide text-white/85" aria-hidden>
            {initials(name)}
          </span>
        </div>
      )}
    </>
  )
}

export function VideoGrid() {
  const participants = useMeetingStore((s) => s.participants)
  const view = useMeetingStore((s) => s.view)
  const selfSpeaking = useMeetingStore((s) => s.isSelfSpeaking)

  const speakerIds = participants.filter((p) => !p.screenShare).map((p) => p.id)
  const simulatedSpeakers = useSimulatedSpeakers(speakerIds)
  const myUserId = useUserStore((s) => s.user?.id)

  const enriched = participants.map((p) => ({
    ...p,
    speaking: p.userId === myUserId ? selfSpeaking : p.speaking || simulatedSpeakers.has(p.id),
  }))

  const people = enriched.filter((p) => !p.screenShare)
  const share = enriched.find((p) => p.screenShare)

  if (view === 'screen-share' && share) {
    return (
      <div className="flex h-full flex-col gap-3 p-3 sm:p-4">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted/40">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <MonitorUp className="h-10 w-10 text-muted-foreground/60" />
            <span className="text-sm font-medium text-muted-foreground">
              {share.name} is presenting
            </span>
            <span className="text-xs text-muted-foreground/60">Screen share preview (mock)</span>
          </div>
          <div className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white">
            Presenting · {share.name}
          </div>
        </div>
        <div className="flex shrink-0 gap-3 overflow-x-auto pb-1">
          {people.map((p, i) => (
            <div key={p.id} className="w-44 shrink-0 sm:w-56">
              <VideoTile participant={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const gridClass =
    people.length <= 1
      ? 'grid-cols-1'
      : people.length <= 4
        ? 'grid-cols-2'
        : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div className={cn('grid h-full auto-rows-fr gap-3 overflow-y-auto p-3 sm:p-4', gridClass)}>
      {people.map((p, i) => (
        <VideoTile key={p.id} participant={p} index={i} />
      ))}
    </div>
  )
}