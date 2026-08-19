import { motion } from 'framer-motion'
import {
  Hand,
  LayoutGrid,
  MessageSquare,
  MonitorUp,
  PenTool,
  ShieldCheck,
} from 'lucide-react'

const FEATURES = [
  {
    icon: PenTool,
    title: 'Infinite whiteboard',
    description:
      'A shared canvas that never runs out of space. Draw, annotate, and brainstorm together in real time.',
  },
  {
    icon: LayoutGrid,
    title: 'Adaptive video grid',
    description:
      'Speaker spotlight, gallery view, or screen-share focus — the layout reshapes itself as your class moves.',
  },
  {
    icon: MessageSquare,
    title: 'Live chat & reactions',
    description:
      'Keep questions flowing with fast chat, emoji, file placeholders, and typing indicators.',
  },
  {
    icon: Hand,
    title: 'Raise hand',
    description:
      'Students signal when they have something to say. No more talking over each other.',
  },
  {
    icon: MonitorUp,
    title: 'Screen sharing',
    description:
      'Share a tab, window, or full screen in one click, with perfect clarity from any device.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure rooms',
    description:
      'Every room gets a unique invite code and role-based controls. Only invited learners get in.',
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a great lesson needs.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for teachers, loved by students. Excurion combines the tools of a physical
            classroom with the reach of the internet.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group bg-card p-6 transition-colors duration-200 hover:bg-accent/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary transition-colors duration-200 group-hover:border-primary/40 group-hover:bg-muted">
                <feature.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}