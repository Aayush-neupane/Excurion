import { useCallback, useEffect, useState } from 'react'
import type { ThemeMode } from '@/types/settings'
import { STORAGE_KEYS } from '@/constants'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') return getSystemTheme()
  return mode
}

function applyTheme(theme: 'dark' | 'light') {
  const root = document.documentElement
  root.classList.toggle('light', theme === 'light')
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

function loadStoredMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.theme)
    if (raw === 'dark' || raw === 'light' || raw === 'system') return raw
  } catch {
    // ignore
  }
  return 'dark'
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(loadStoredMode)

  useEffect(() => {
    applyTheme(resolveTheme(mode))
    localStorage.setItem(STORAGE_KEYS.theme, mode)
  }, [mode])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => {
      if (mode === 'system') applyTheme(resolveTheme('system'))
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [mode])

  const toggle = useCallback(() => {
    setMode((m) => {
      const next: ThemeMode = m === 'dark' ? 'light' : m === 'light' ? 'dark' : 'dark'
      return next
    })
  }, [])

  const set = useCallback((next: ThemeMode) => setMode(next), [])

  return { mode, toggle, set }
}