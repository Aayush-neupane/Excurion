import { motion } from 'framer-motion'
import { Hand, Mic, MicOff } from 'lucide-react'
import { useMeetingStore } from '@/store/useMeetingStore'
import { UserAvatar } from '@/components/common/UserAvatar'
import { cn } from '@/lib/utils'

/**
 * When the whiteboard is the primary workspace, videos collapse into
 * floating tiles so the canvas stays the focus (spec requirement).
 */
export function FloatingVideoStrip() {
  const participants = useMeetingStore((s) => s.participants)
  const micEnabled = useMeetingStore((s) => s.micEnabled)
  const cameraEnabled = useMeetingStore((s) => s.cameraEnabled)
  const toggleMic = useMeetingStore((s) => s.toggleMic)
  const toggleCamera = useMeetingStore((s) => s.toggleCamera)

  const self = participants.find((p) => p.id === 'p-self')
  const others = participants.filter((p) => p.id !== 'p-self').slice(0, 3)

  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex gap-2">
      {self && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="pointer-events-auto w-28 overflow-hidden rounded-xl border border-border bg-card shadow-soft"
          role="group"
          aria-label="Your video preview"
        >
          <div
            className={cn(
              'relative aspect-video w-full bg-muted/40',
              cameraEnabled ? '' : 'flex items-center justify-center',
            )}
          >
            {cameraEnabled ? (
              <div
                className="absolute inset-0 opacity-40"
                style={{ background: 'linear-gradient(135deg, hsl(245 30% 32%), hsl(210 28% 24%))' }}
                aria-hidden
              />
            ) : (
              <UserAvatar name={self.name} className="h-8 w-8" />
            )}
            <button
              onClick={toggleMic}
              aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              className={cn(
                'absolute bottom-1 right-1 rounded-full p-1 shadow-sm transition-colors',
                micEnabled ? 'bg-black/50 text-white' : 'bg-destructive text-white',
              )}
            >
              {micEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            </button>
            <button
              onClick={toggleCamera}
              aria-label={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
              className="absolute bottom-1 left-1 rounded-full bg-black/40 p-1 text-white transition-colors hover:bg-black/60"
            >
              <span className="block h-3 w-3 rounded-full border-2 border-current opacity-80" aria-hidden />
            </button>
          </div>
          <p className="truncate bg-background/80 px-2 py-1 text-[10px] font-medium">
            {self.name.replace(' (You)', '')} (You)
          </p>
        </motion.div>
      )}

      {others.map((p, i) => (
        <motion.div
          layout
          key={p.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: i * 0.06 }}
          className="hidden w-24 overflow-hidden rounded-xl border border-border bg-card shadow-soft sm:block"
          role="group"
          aria-label={`${p.name}'s video`}
        >
          <div
            className={cn(
              'relative aspect-video w-full bg-muted/40',
              p.camera === 'off' && 'flex items-center justify-center',
            )}
          >
            {p.camera === 'off' ? (
              <UserAvatar name={p.name} className="h-7 w-7" />
            ) : (
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `linear-gradient(135deg, hsl(${(p.name.length * 37) % 360} 30% 30%), hsl(${(p.name.length * 47 + 60) % 360} 26% 22%))`,
                }}
                aria-hidden
              />
            )}
            {p.raisedHand && (
              <span className="absolute right-1 top-1 rounded-full bg-warning p-0.5 text-warning-foreground" aria-label="Hand raised">
                <Hand className="h-2.5 w-2.5" />
              </span>
            )}
            <span
              className={cn(
                'absolute bottom-1 right-1 rounded-full p-0.5',
                p.mic === 'on' ? 'bg-black/50' : 'bg-destructive',
              )}
              title={p.mic === 'on' ? 'Microphone on' : 'Microphone muted'}
            >
              {p.mic === 'on' ? (
                <Mic className="h-3 w-3 text-white" />
              ) : (
                <MicOff className="h-3 w-3 text-white" />
              )}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}