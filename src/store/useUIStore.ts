import { create } from 'zustand'

type DialogId = 'create-room' | 'join-room' | 'leave-confirm' | 'settings'

interface UIState {
  dialogs: Partial<Record<DialogId, boolean>>
  isMobileNavOpen: boolean
  isCommandPaletteOpen: boolean
  openDialog: (id: DialogId) => void
  closeDialog: (id: DialogId) => void
  toggleMobileNav: () => void
  setMobileNav: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  dialogs: {},
  isMobileNavOpen: false,
  isCommandPaletteOpen: false,
  openDialog: (id) => set((s) => ({ dialogs: { ...s.dialogs, [id]: true } })),
  closeDialog: (id) => set((s) => ({ dialogs: { ...s.dialogs, [id]: false } })),
  toggleMobileNav: () => set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen })),
  setMobileNav: (isMobileNavOpen) => set({ isMobileNavOpen }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
}))

export function useDialogOpen(id: DialogId): boolean {
  return useUIStore((s) => s.dialogs[id] === true)
}