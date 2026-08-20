import type { WhiteboardSnapshot, WhiteboardSyncAdapter, WhiteboardCollaborator } from '@/types/whiteboard'
import { getSupabase } from '@/lib/supabase/client'

export const WHITEBOARD_CHANNEL = (roomId: string) => `room:${roomId}:whiteboard`

interface SnapshotRow {
  room_id: string
  version: number
  document: unknown
  updated_by: string | null
  updated_at: string
}

function toSnapshot(row: SnapshotRow, documentId: string): WhiteboardSnapshot {
  return {
    documentId,
    version: row.version,
    updatedAt: row.updated_at,
    document: row.document,
  }
}

export const supabaseWhiteboardApi = {
  async getDocument(meetingId: string) {
    const supabase = getSupabase()
    const { data: room, error } = await supabase
      .from('rooms')
      .select('id, created_at, updated_at')
      .eq('id', meetingId)
      .single()
    if (error) throw new Error(error.message)

    const { data: snapshot, error: snapshotError } = await supabase
      .from('whiteboard_snapshots')
      .select('room_id, version, updated_at')
      .eq('room_id', meetingId)
      .maybeSingle()
    if (snapshotError) throw new Error(snapshotError.message)

    return {
      id: meetingId,
      title: 'Whiteboard',
      createdAt: room.created_at,
      updatedAt: snapshot?.updated_at ?? room.updated_at,
      version: snapshot?.version ?? 1,
      collaborators: [] as string[],
    }
  },

  async getSnapshot(documentId: string): Promise<WhiteboardSnapshot> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('whiteboard_snapshots')
      .select('room_id, version, document, updated_by, updated_at')
      .eq('room_id', documentId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) {
      return { documentId, version: 1, updatedAt: new Date().toISOString(), document: null }
    }
    return toSnapshot(data, documentId)
  },

  async saveSnapshot(documentId: string, document: unknown): Promise<WhiteboardSnapshot> {
    const supabase = getSupabase()
    const current = await supabaseWhiteboardApi.getSnapshot(documentId)
    const { data, error } = await supabase.rpc('save_whiteboard_snapshot', {
      p_room_id: documentId,
      p_document: document as never,
      p_version: current.version + 1,
    })
    if (error) throw new Error(error.message)
    return toSnapshot(data as SnapshotRow, documentId)
  },

  async listRecentDocuments() {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('whiteboard_snapshots')
      .select('room_id, version, updated_at, rooms(title)')
      .order('updated_at', { ascending: false })
      .limit(10)
    if (error) throw new Error(error.message)
    return (data ?? []).map(
      (row: { room_id: string; version: number; updated_at: string; rooms: { title: string } | null }) => ({
        id: row.room_id,
        title: row.rooms?.title ?? 'Whiteboard',
        createdAt: row.updated_at,
        updatedAt: row.updated_at,
        version: row.version,
        collaborators: [],
      }),
    )
  },

  async getSyncAdapter(_meetingId: string): Promise<WhiteboardSyncAdapter> {
    return createSupabaseSyncAdapter(_meetingId)
  },
}

/**
 * Realtime Broadcast-backed sync adapter — replaces the mock socket.
 *
 * Wire events on channel `room:{roomId}:whiteboard` (broadcast, self-excluded):
 *   'snapshot'  -> { roomId, version, document, updatedAt, byUserId }
 *   'presence'  -> managed via Realtime Presence (presence keyed by userId)
 *   'cursor'    -> { x, y } cursor telemetry (ephemeral)
 *
 * Durable state persists to whiteboard_snapshots (debounced by caller).
 */
export function createSupabaseSyncAdapter(meetingId: string): WhiteboardSyncAdapter {
  const supabase = getSupabase()
  const channel = supabase.channel(WHITEBOARD_CHANNEL(meetingId))
  let remoteUpdateCb: ((snapshot: WhiteboardSnapshot) => void) | undefined
  let presenceCb: ((collaborators: WhiteboardCollaborator[]) => void) | undefined

  return {
    async connect() {
      channel.on('broadcast', { event: 'snapshot' }, ({ payload }) => {
        const p = payload as {
          roomId: string
          version: number
          document: unknown
          updatedAt: string
          byUserId: string
        }
        remoteUpdateCb?.({
          documentId: p.roomId,
          version: p.version,
          updatedAt: p.updatedAt,
          document: p.document,
        })
      })

      channel.on('presence', { event: 'sync' }, () => {
        const states = channel.presenceState<{
          userId: string
          name: string
          avatarUrl?: string
          state: 'idle' | 'editing' | 'viewing'
        }>()
        const collaborators: WhiteboardCollaborator[] = Object.values(states).map((entry) => {
          const p = entry[0]
          return { userId: p.userId, name: p.name, avatarUrl: p.avatarUrl, state: p.state }
        })
        presenceCb?.(collaborators)
      })

      await channel.subscribe()
    },

    disconnect() {
      channel.unsubscribe()
      remoteUpdateCb = undefined
      presenceCb = undefined
    },

    async getSnapshot() {
      return supabaseWhiteboardApi.getSnapshot(meetingId)
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
      void channel.send({
        type: 'broadcast',
        event: 'snapshot',
        payload: {
          roomId: meetingId,
          version: snapshot.version,
          document: snapshot.document,
          updatedAt: snapshot.updatedAt,
          byUserId,
        },
      })
    },

    updatePresence(state) {
      void supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', data.user.id)
          .maybeSingle()
        void channel.track({
          userId: data.user.id,
          name: profile?.name ?? 'You',
          avatarUrl: profile?.avatar_url ?? undefined,
          state,
        })
      })
    },
  }
}