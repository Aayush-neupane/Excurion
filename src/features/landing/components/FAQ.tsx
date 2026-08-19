import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: 'Do students need to install anything?',
    a: 'No. Excurion runs entirely in the browser — students join with a link, no downloads, no extensions. All they need is a camera and microphone access.',
  },
  {
    q: 'How many participants can join a class?',
    a: 'The Free plan supports up to 20 participants. Pro scales to 200, and Schools can go unlimited with custom infrastructure.',
  },
  {
    q: 'Is the whiteboard really synchronized in real time?',
    a: 'Yes. Every stroke, sticky note, and shape syncs instantly across the room with multiplayer presence — who is drawing what, right where they are on the canvas.',
  },
  {
    q: 'Are classes recorded automatically?',
    a: 'Hosts can enable recordings with one click. Free plans keep recordings for 48 hours; Pro keeps them indefinitely in your library.',
  },
  {
    q: 'What happens if my connection drops mid-lesson?',
    a: 'Excurion reconnects automatically and restores your video, audio, and whiteboard state. A connection-quality indicator helps you spot issues early.',
  },
  {
    q: 'Can I use Excurion on a tablet?',
    a: 'Absolutely. The layout adapts intelligently, and the whiteboard shines on touch screens — perfect for annotating from anywhere in the room.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Questions, answered.
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i
            return (
              <div
                key={faq.q}
                className={cn(
                  'overflow-hidden rounded-xl border transition-colors',
                  isOpen ? 'bg-card' : 'bg-card/50 hover:bg-card/70',
                )}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-muted-foreground"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}