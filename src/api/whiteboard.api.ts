import type {
  WhiteboardCollaborator,
  WhiteboardMeta,
  WhiteboardSnapshot,
  WhiteboardSyncAdapter,
} from '@/types/whiteboard'
import { mockResult } from './client'

export interface WhiteboardApi {
  getDocument(meetingId: string): Promise<WhiteboardMeta>
  getSnapshot(documentId: string): Promise<WhiteboardSnapshot>
  saveSnapshot(documentId: string, document: unknown): Promise<WhiteboardSnapshot>
  listRecentDocuments(): Promise<WhiteboardMeta[]>
  getSyncAdapter(meetingId: string): Promise<WhiteboardSyncAdapter>
}

const recentTitles = [
  'Derivatives — Chain Rule Examples',
  'Newton’s Laws Lab Diagram',
  'Periodic Trends Mind Map',
  'SAT Quant — Strategy Notes',
]

export const mockWhiteboardApi: WhiteboardApi = {
  async getDocument(meetingId) {
    return mockResult(
      {
        id: `wb-${meetingId}`,
        title: 'Whiteboard',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        collaborators: [],
      },
      300,
    )
  },

  async getSnapshot(documentId) {
    return mockResult(
      {
        documentId,
        version: 1,
        updatedAt: new Date().toISOString(),
        document: null,
      },
      300,
    )
  },

  async saveSnapshot(documentId, document) {
    return mockResult(
      {
        documentId,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
        document,
      },
      150,
    )
  },

  async listRecentDocuments() {
    return mockResult(
      recentTitles.map((title, i) => ({
        id: `wb-recent-${i}`,
        title,
        createdAt: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
        updatedAt: new Date(Date.now() - i * 43_200_000).toISOString(),
        version: 3 + i,
        collaborators: [],
      })),
    )
  },

  async getSyncAdapter() {
    return mockResult(createMockSyncAdapter())
  },
}

/**
 * Mock Socket.IO-style adapter. Mirrors the wire events a real socket
 * implementation would emit:
 *   connect → snapshot → remote-update / presence → disconnect
 */
function createMockSyncAdapter(): WhiteboardSyncAdapter {
  let remoteUpdateCb: ((snapshot: WhiteboardSnapshot) => void) | undefined
  let presenceCb: ((collaborators: WhiteboardCollaborator[]) => void) | undefined

  const initialCollaborators: WhiteboardCollaborator[] = [
    { userId: 'u-1', name: 'Tony Stark (You)', state: 'editing' },
    { userId: 'u-3', name: 'Peter Parker', state: 'viewing' },
    { userId: 'u-4', name: 'Bruce Banner', state: 'viewing' },
  ]

  return {
    async connect(documentId) {
      await mockResult(undefined, 450)
      void documentId
      presenceCb?.(initialCollaborators)
    },
    disconnect() {
      remoteUpdateCb = undefined
      presenceCb = undefined
    },
    async getSnapshot() {
      return mockResult(
        {
          documentId: 'wb-mock',
          version: 1,
          updatedAt: new Date().toISOString(),
          document: null,
        },
        300,
      )
    },
    onRemoteUpdate(cb) {
      remoteUpdateCb = cb
      return () => {
        remoteUpdateCb = undefined
      }
    },
    onPresenceChange(cb) {
      presenceCb = cb
      return () => {
        presenceCb = undefined
      }
    },
    publishUpdate(snapshot, byUserId) {
      // `byUserId` → who published; a real socket impl would broadcast.
      void byUserId
      remoteUpdateCb?.({ ...snapshot, documentId: 'wb-mock' })
    },
    updatePresence(state) {
      const others = initialCollaborators.filter((c) => c.userId !== 'u-1')
      presenceCb?.([
        { userId: 'u-1', name: 'Tony Stark (You)', state },
        ...others,
      ])
    },
  }
}

export const whiteboardApi: WhiteboardApi = mockWhiteboardApi