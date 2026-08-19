import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Tldraw,
  getSnapshot,
  loadSnapshot,
  useTLStore,
  type TLEditorSnapshot,
} from 'tldraw'
import 'tldraw/tldraw.css'
import { motion } from 'framer-motion'
import { CloudOff, CloudUpload, Loader2, Users } from 'lucide-react'
import type {
  WhiteboardCollaborator,
  WhiteboardSnapshot,
  WhiteboardSyncAdapter,
} from '@/types/whiteboard'
import { useWhiteboardStore } from '@/store/useWhiteboardStore'
import { useMeetingStore } from '@/store/useMeetingStore'
import { whiteboardApi } from '@/api'
import { UserAvatar } from '@/components/common/UserAvatar'
import { FloatingVideoStrip } from './FloatingVideoStrip'
import { cn } from '@/lib/utils'

type SyncStatus = 'connecting' | 'connected' | 'syncing' | 'offline'

const SYNC_STATUS_META: Record<SyncStatus, { label: string; icon: typeof CloudUpload; className: string }> = {
  connecting: { label: 'Connecting…', icon: Loader2, className: 'text-muted-foreground' },
  connected: { label: 'Synced', icon: CloudUpload, className: 'text-success' },
  syncing: { label: 'Syncing…', icon: CloudUpload, className: 'text-warning' },
  offline: { label: 'Offline', icon: CloudOff, className: 'text-destructive' },
}

export function WhiteboardPanel() {
  const meetingId = useMeetingStore((s) => s.meeting?.id) ?? 'm-1'
  const setStoreSyncStatus = useWhiteboardStore((s) => s.setSyncStatus)

  // Local store; when the real backend ships, swap `useTLStore({})` for
  // the tldraw sync hook backed by Socket.IO — this component changes
  // only at this line.
  const store = useTLStore({})
  const adapterRef = useRef<WhiteboardSyncAdapter | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting')
  const [collaborators, setCollaborators] = useState<WhiteboardCollaborator[]>([])
  const [connecting, setConnecting] = useState(true)

  const updateStatus = useCallback(
    (status: SyncStatus) => {
      setSyncStatus(status)
      setStoreSyncStatus(status === 'connected' ? 'connected' : 'connecting')
    },
    [setStoreSyncStatus],
  )

  // Publish local changes (throttled) — mirrors the Socket.IO `emit` path
  useEffect(() => {
    const pending = { timer: null as ReturnType<typeof setTimeout> | null, inflight: false }
    const publish = () => {
      pending.timer = null
      const adapter = adapterRef.current
      if (!adapter) return
      updateStatus('syncing')
      adapter.publishUpdate(
        {
          documentId: 'wb-mock',
          version: Date.now(),
          updatedAt: new Date().toISOString(),
          document: getSnapshot(store),
        },
        'u-1',
      )
      window.setTimeout(() => updateStatus('connected'), 400)
    }
    const unlisten = store.listen(
      () => {
        if (pending.inflight) return
        pending.inflight = true
        window.setTimeout(() => {
          pending.inflight = false
        }, 250)
        if (pending.timer) clearTimeout(pending.timer)
        pending.timer = setTimeout(publish, 500)
      },
      { source: 'user', scope: 'document' },
    )
    return () => {
      unlisten()
      if (pending.timer) clearTimeout(pending.timer)
    }
  }, [store, updateStatus])

  // Connect to the (mock) sync room — mirrors the Socket.IO `connect` path
  const documentIdRef = useRef(meetingId)
  useEffect(() => {
    let disposed = false
    const unsubscribers: (() => void)[] = []
    const documentId = documentIdRef.current

    async function connect() {
      try {
        const adapter = await whiteboardApi.getSyncAdapter(documentId)
        if (disposed) {
          adapter.disconnect()
          return
        }
        adapterRef.current = adapter
        await adapter.connect('wb-mock')

        const snapshot = await adapter.getSnapshot()
        if (disposed) return
        if (snapshot.document) {
          try {
            loadSnapshot(store, snapshot.document as TLEditorSnapshot)
          } catch {
            // Ignore malformed snapshots (mock)
          }
        }

        unsubscribers.push(adapter.onPresenceChange(setCollaborators))
        unsubscribers.push(
          adapter.onRemoteUpdate((remote: WhiteboardSnapshot) => {
            if (!remote.document) return
            try {
              loadSnapshot(store, remote.document as TLEditorSnapshot)
            } catch {
              // Ignore malformed snapshots (mock)
            }
          }),
        )
        adapter.updatePresence('editing')
        updateStatus('connected')
        setConnecting(false)
      } catch {
        if (!disposed) {
          updateStatus('offline')
          setConnecting(false)
        }
      }
    }

    void connect()

    return () => {
      disposed = true
      unsubscribers.forEach((unsub) => unsub())
      adapterRef.current?.disconnect()
      adapterRef.current = null
    }
  }, [store, updateStatus])

  const meta = SYNC_STATUS_META[syncStatus]

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Tldraw
        store={store}
        colorScheme="dark"
        className="h-full w-full"
        components={{
          // Keep the canvas calm: hide the chrome that belongs to a
          // single-player app (menu drawer, page panel, debug). The
          // quick actions, contextual style panel and zoom controls
          // stay — they carry the workflow the whiteboard needs.
          MenuPanel: null,
          PageMenu: null,
          TopPanel: null,
          DebugPanel: null,
          DebugMenu: null,
          SharePanel: null,
          PeopleMenu: null,
          HelpMenu: null,
        }}
      />

      {/* Sync status + presence overlay */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 shadow-sm">
          <meta.icon
            className={cn('h-3.5 w-3.5', meta.className, syncStatus === 'connecting' && 'animate-spin')}
          />
          <span className="text-[11px] font-medium text-muted-foreground">{meta.label}</span>
        </div>
        {collaborators.length > 0 && (
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 shadow-sm">
            <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            {collaborators.map((c) => (
              <div key={c.userId} className="relative" title={`${c.name} — ${c.state}`}>
                <UserAvatar name={c.name} className="h-5 w-5" />
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background',
                    c.state === 'editing' ? 'bg-primary' : 'bg-muted',
                  )}
                  aria-hidden
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading veil while connecting */}
      {connecting && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Connecting to whiteboard…</span>
          </div>
        </motion.div>
      )}

      {/* Floating video tiles, per spec */}
      <FloatingVideoStrip />
    </div>
  )
}