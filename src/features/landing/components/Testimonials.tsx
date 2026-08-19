import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { UserAvatar } from '@/components/common/UserAvatar'

const TESTIMONIALS = [
  {
    name: 'Dr. Jane Foster',
    role: 'Mathematics Professor · State University',
    quote:
      'The whiteboard alone is worth it. My students annotate together and actually ask more questions than they do in person.',
  },
  {
    name: 'Stephen Strange',
    role: 'Physics Teacher · Westbrook High',
    quote:
      'We migrated 300+ students in a week. The layout adapts so well that lab demos feel like being in the room.',
  },
  {
    name: 'Monica Rambeau',
    role: 'K-12 Coordinator · LearnSphere Network',
    quote:
      'Excurion is the first virtual classroom that feels premium. Kids engage, no one talks over anyone, and recordings are ready instantly.',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by educators everywhere.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:bg-accent/40"
            >
              <Quote className="h-5 w-5 text-primary/60" aria-hidden />
              <div className="mt-4 flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <UserAvatar name={t.name} className="h-10 w-10" />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}