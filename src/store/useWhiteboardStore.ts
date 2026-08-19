import { create } from 'zustand'
import type { WhiteboardCollaborator, WhiteboardSyncAdapter } from '@/types/whiteboard'
import { whiteboardApi } from '@/api/whiteboard.api'

type WhiteboardTool = 'select' | 'draw' | 'eraser' | 'text' | 'arrow' | 'sticky' | 'shape' | 'image'

interface WhiteboardState {
  isOpen: boolean
  documentId: string | null
  collaborators: WhiteboardCollaborator[]
  syncAdapter: WhiteboardSyncAdapter | null
  syncStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  tool: WhiteboardTool
  open: (meetingId: string) => Promise<void>
  close: () => void
  setTool: (tool: WhiteboardTool) => void
  setCollaborators: (collaborators: WhiteboardCollaborator[]) => void
  setSyncStatus: (status: WhiteboardState['syncStatus']) => void
  setAdapter: (adapter: WhiteboardSyncAdapter | null) => void
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  isOpen: false,
  documentId: null,
  collaborators: [],
  syncAdapter: null,
  syncStatus: 'disconnected',
  tool: 'select',

  async open(meetingId) {
    set({ isOpen: true, syncStatus: 'connecting' })
    const meta = await whiteboardApi.getDocument(meetingId)
    set({ documentId: meta.id })
  },

  close: () => {
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