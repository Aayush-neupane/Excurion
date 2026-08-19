import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import {
  Bell,
  LayoutDashboard,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
  Video,
  X,
} from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useThemeContext } from '@/app/providers/theme-provider'
import { cn } from '@/lib/utils'

interface Action {
  id: string
  label: string
  hint?: string
  icon: typeof Search
  perform: () => void
}

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, openDialog } = useUIStore()
  const { mode, toggle } = useThemeContext()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isCommandPaletteOpen, setCommandPaletteOpen])

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isCommandPaletteOpen])

  const actions = useMemo<Action[]>(() => {
    const base: Action[] = [
      {
        id: 'create-room',
        label: 'Create a new room',
        hint: 'Start teaching immediately',
        icon: Plus,
        perform: () => openDialog('create-room'),
      },
      {
        id: 'join-room',
        label: 'Join a room with a code',
        hint: 'Enter a 4-4-4 room code',
        icon: Video,
        perform: () => openDialog('join-room'),
      },
      { id: 'nav-dash', label: 'Go to dashboard', icon: LayoutDashboard, perform: () => navigate('/app') },
      { id: 'nav-notif', label: 'Go to notifications', icon: Bell, perform: () => navigate('/app/notifications') },
      { id: 'nav-profile', label: 'Go to profile', icon: User, perform: () => navigate('/app/profile') },
      { id: 'nav-settings', label: 'Go to settings', icon: Settings, perform: () => navigate('/app/settings') },
      {
        id: 'toggle-theme',
        label: mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode',
        icon: mode === 'light' ? Moon : Sun,
        perform: toggle,
      },
    ]
    if (!query.trim()) return base
    const q = query.trim().toLowerCase()
    return base.filter((a) => a.label.toLowerCase().includes(q))
  }, [query, mode, navigate, openDialog, toggle])

  if (!isCommandPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setCommandPaletteOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-popover shadow-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search commands"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
            aria-label="Close command menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {actions.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for “{query}”
            </p>
          )}
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                setCommandPaletteOpen(false)
                action.perform()
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent',
              )}
            >
              <action.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 font-medium">{action.label}</span>
              {action.hint && (
                <span className="text-xs text-muted-foreground">{action.hint}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-border bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span className="ml-auto">esc to close</span>
        </div>
      </motion.div>
    </div>
  )
}