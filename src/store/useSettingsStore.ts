import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS, type SettingsState } from '@/types/settings'
import { STORAGE_KEYS } from '@/constants'

type Section = keyof SettingsState

interface SettingsStore {
  settings: SettingsState
  update: <K extends Section>(section: K, patch: Partial<SettingsState[K]>) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (section, patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            [section]: {
              ...(s.settings[section] as unknown as Record<string, unknown>),
              ...(patch as unknown as Record<string, unknown>),
            } as unknown as SettingsState[typeof section],
          },
        })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: STORAGE_KEYS.settings,
      partialize: (s) => ({ settings: s.settings }),
    },
  ),
)

export function useSettings(): SettingsState {
  return useSettingsStore((s) => s.settings)
}

export function useAppearanceSettings() {
  return useSettingsStore((s) => s.settings.appearance)
}

export function useAccessibilitySettings() {
  return useSettingsStore((s) => s.settings.accessibility)
}

export function useAudioSettings() {
  return useSettingsStore((s) => s.settings.audio)
}

export function useVideoSettings() {
  return useSettingsStore((s) => s.settings.video)
}

export function useNotificationSettings() {
  return useSettingsStore((s) => s.settings.notifications)
}