import { create } from 'zustand'
import type { WhiteboardCollaborator, WhiteboardSyncAdapter } from '@/types/whiteboard'
import { whiteboardApi } from '@/api/whiteboard.api'

type WhiteboardTool = 'select' | 'draw' | 'eraser' | 'text' | 'arrow' | 'sticky' | 'shape' | 'image'

/** Cooldown after open() during which close() is ignored — prevents
 *  a quick double-tap from destroying the board by remounting it. */
const TOGGLE_COOLDOWN_MS = 500

interface WhiteboardState {
  isOpen: boolean
  documentId: string | null
  collaborators: WhiteboardCollaborator[]
  syncAdapter: WhiteboardSyncAdapter | null
  syncStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  tool: WhiteboardTool
  lastOpenAt: number
  open: (meetingId: string) => Promise<void>
  close: () => void
  setTool: (tool: WhiteboardTool) => void
  setCollaborators: (collaborators: WhiteboardCollaborator[]) => void
  setSyncStatus: (status: WhiteboardState['syncStatus']) => void
  setAdapter: (adapter: WhiteboardSyncAdapter | null) => void
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  isOpen: false,
  documentId: null,
  collaborators: [],
  syncAdapter: null,
  syncStatus: 'disconnected',
  tool: 'select',
  lastOpenAt: 0,

  async open(meetingId) {
    const s = get()
    if (s.isOpen && s.documentId === meetingId) return
    set({ isOpen: true, syncStatus: 'connecting', lastOpenAt: Date.now() })
    const meta = await whiteboardApi.getDocument(meetingId)
    set({ documentId: meta.id })
  },

  close: () => {
    if (Date.now() - get().lastOpenAt < TOGGLE_COOLDOWN_MS) return
    set((s) => {
      s.syncAdapter?.disconnect()
      return {
        isOpen: false,
        syncAdapter: null,
        collaborators: [],
        syncStatus: 'disconnected',
        documentId: null,
      }
    })
  },

  setTool: (tool) => set({ tool }),
  setCollaborators: (collaborators) => set({ collaborators }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setAdapter: (syncAdapter) => set({ syncAdapter }),
}))

export function useWhiteboardOpen(): boolean {
  return useWhiteboardStore((s) => s.isOpen)
}