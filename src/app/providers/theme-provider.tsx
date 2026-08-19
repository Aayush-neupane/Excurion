import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeMode } from '@/types/settings'

interface ThemeContextValue {
  mode: ThemeMode
  resolved: 'dark' | 'light'
  toggle: () => void
  set: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { mode, toggle, set } = useTheme()
  const resolved = mode === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : mode

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, toggle, set }),
    [mode, resolved, toggle, set],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider')
  return ctx
}