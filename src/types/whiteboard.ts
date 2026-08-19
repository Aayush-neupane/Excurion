import type { ID, User } from './user'

export type WhiteboardCollaboratorState = 'idle' | 'editing' | 'viewing'

export interface WhiteboardCollaborator {
  userId: ID
  name: string
  avatarUrl?: string
  state: WhiteboardCollaboratorState
  cursor?: { x: number; y: number }
}

export interface WhiteboardSnapshot {
  documentId: ID
  version: number
  updatedAt: string
  /** tldraw snapshot payload */
  document: unknown
}

export interface WhiteboardSession {
  documentId: ID
  meetingId?: ID
  collaborators: WhiteboardCollaborator[]
}

/** Adapter contract so the mock sync engine can be swapped for Socket.IO later. */
export interface WhiteboardSyncAdapter {
  connect(documentId: ID): Promise<void>
  disconnect(): void
  getSnapshot(): Promise<WhiteboardSnapshot>
  onRemoteUpdate(cb: (snapshot: WhiteboardSnapshot) => void): () => void
  onPresenceChange(cb: (collaborators: WhiteboardCollaborator[]) => void): () => void
  publishUpdate(snapshot: WhiteboardSnapshot, byUserId: ID): void
  updatePresence(state: WhiteboardCollaboratorState): void
}

export interface WhiteboardSnapshotStore {
  documentId: ID
  version: number
  record: Record<string, unknown>
  updatedAt: string
}

export interface RecentDocument {
  id: ID
  title: string
  meetingId?: ID
  updatedAt: string
  thumbnail?: string
}

export interface WhiteboardMeta {
  id: ID
  title: string
  createdAt: string
  updatedAt: string
  version: number
  collaborators: ID[]
}

export interface WhiteboardUserLookup {
  [userId: string]: Pick<User, 'id' | 'name' | 'avatarUrl'>
}