import { motion } from 'framer-motion'
import { Compass, Home } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <p className="text-[6rem] font-semibold leading-none tracking-tight text-primary sm:text-[8rem]">
          404
        </p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 flex flex-col items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">This page took a detour</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The page you're looking for doesn't exist, was moved, or the room link has expired.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Button asChild>
              <Link to="/app">
                <Home className="h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/">
                <Logo />
                Visit homepage
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}