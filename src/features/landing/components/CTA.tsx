import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-4xl rounded-xl border border-border bg-card px-6 py-16 text-center sm:px-12"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to open your virtual classroom?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Setup takes under a minute. Invite your students, share the code, and teach your best lesson yet.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link to="/register">
              Create your classroom
              <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}