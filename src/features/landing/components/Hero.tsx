import { motion } from 'framer-motion'
import { ArrowRight, Mic, MicOff, Play, Video, VideoOff, Volume2, Wifi } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar as Avatar } from '@/components/common/UserAvatar'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const TILE_TONES: Record<string, string> = {
  'Ava Thompson': 'bg-blue-500/25',
  'Sofia Reyes': 'bg-violet-500/25',
  "Liam O'Connor": 'bg-cyan-600/25',
  'Noah Williams': 'bg-emerald-600/25',
}

function MeetingWindow() {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" aria-hidden />
          <span className="ml-3 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Wifi className="h-3 w-3 text-success" />
            Connected · calculus-2x-deriv
          </span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">00:42:18</span>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-2 gap-2.5 p-2.5">
          <Tile name="Ava Thompson" role="Host" mic speaking />
          <Tile name="Sofia Reyes" role="Student" mic />
          <Tile name="Liam O'Connor" role="Student" mic={false} />
          <Tile name="Noah Williams" role="Student" mic={false} camera={false} />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-center gap-2 border-t border-border bg-muted/50 px-4 py-3">
          <ToolbarButton active icon={Mic} label="Microphone" />
          <ToolbarButton icon={Video} label="Camera" />
          <ToolbarButton icon={Volume2} label="Audio" />
          <span className="mx-1.5 h-6 w-px bg-border" aria-hidden />
          <Button size="icon" className="h-9 w-9 rounded-full bg-destructive hover:bg-destructive/90">
            <span className="sr-only">Leave</span>
            <Play className="h-4 w-4 -scale-x-100" />
          </Button>
        </div>
      </motion.div>

      {/* Floating chat card */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -right-4 top-14 hidden w-56 rounded-lg border border-border bg-card p-3 shadow-lg sm:block lg:-right-8"
      >
        <div className="flex items-start gap-2">
          <Avatar name="Sofia Reyes" className="h-6 w-6" />
          <p className="text-xs leading-snug text-muted-foreground">
            <span className="font-medium text-foreground">Sofia:</span> could we go over problem 3?
          </p>
        </div>
        <div className="mt-2.5 flex items-center gap-1 rounded-md bg-muted px-2 py-1.5 text-[11px] text-muted-foreground">
          <span className="typing-dot" /> <span className="typing-dot" /> <span className="typing-dot" />
          <span className="ml-1">Sofia is typing…</span>
        </div>
      </motion.div>

      {/* Floating whiteboard chip */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-4 bottom-24 hidden w-44 rounded-lg border border-border bg-card p-3 shadow-lg sm:block lg:-left-8"
      >
        <p className="text-xs font-medium">Whiteboard</p>
        <div className="mt-2 flex h-16 items-end justify-between gap-1 rounded-md border border-border bg-muted/40 p-2">
          <span className="w-1 rounded-sm bg-primary/70" style={{ height: 40 }} />
          <span className="w-1 rounded-sm bg-primary/70" style={{ height: 24 }} />
          <span className="w-1.5 rounded-sm bg-secondary" style={{ height: 48 }} />
          <span className="w-1 rounded-sm bg-primary/70" style={{ height: 32 }} />
          <span className="w-1 rounded-sm bg-secondary" style={{ height: 20 }} />
        </div>
      </motion.div>
    </div>
  )
}

function Tile({
  name,
  role,
  mic,
  camera = true,
  speaking = false,
  className = '',
}: {
  name: string
  role: string
  mic: boolean
  camera?: boolean
  speaking?: boolean
  className?: string
}) {
  const tone = TILE_TONES[name] ?? 'bg-muted'
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-lg border ${speaking ? 'border-primary' : 'border-border'} ${tone} ${className}`}
    >
      {camera ? (
        <div className="flex h-full items-center justify-center">
          <span className="text-3xl font-semibold text-foreground/80">{name.split(' ').map((p) => p[0]).join('')}</span>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Avatar name={name} className="h-14 w-14 ring-2 ring-border" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/40 px-1.5 py-0.5 text-[11px] text-white">
        {speaking && <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />}
        {mic ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3 text-red-300" />}
        <span>{name}</span>
        {role === 'Host' && <span className="rounded bg-white/20 px-1 text-[9px]">HOST</span>}
      </div>
      {!camera && (
        <div className="absolute right-2 top-2 rounded-md bg-black/40 p-1">
          <VideoOff className="h-3 w-3 text-white/80" />
        </div>
      )}
    </div>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Mic
  label: string
  active?: boolean
}) {
  return (
    <button
      className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${active ? 'bg-primary/15 text-primary' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

export function Hero() {
  return (
    <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Badge variant="outline" className="gap-2 px-3 py-1 text-xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Now in public beta
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            The classroom that
            <br />
            <span className="text-primary">meets anywhere.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Excurion brings live lessons, an infinite whiteboard, and real-time
            collaboration into one calm, distraction-free space.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/register">
                Start teaching free
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link to="/login">
                <Video className="h-4 w-4" />
                Join a class
              </Link>
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-4 text-xs text-muted-foreground"
          >
            Free forever for classrooms · No credit card required
          </motion.p>
        </div>

        <div className="mt-16">
          <MeetingWindow />
        </div>
      </div>

      <style>{`
        .typing-dot {
          width: 4px; height: 4px; border-radius: 9999px;
          background: currentColor; display: inline-block;
          animation: typing 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </section>
  )
}