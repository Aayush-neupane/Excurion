import { useEffect, useRef, useState } from 'react'

/** Ticks every second; returns elapsed seconds since mount. */
export function useStopwatch(active = true): number {
  const [elapsed, setElapsed] = useState(0)
  const startedAtRef = useRef<number>(Date.now())
  useEffect(() => {
    if (!active) return
    startedAtRef.current = Date.now() - elapsed * 1000
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [active, elapsed])
  return elapsed
}

/** Returns the current time, refreshed every `intervalMs`. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(interval)
  }, [intervalMs])
  return now
}

/** Countdown to a future timestamp; null when reached. */
export function useCountdown(target: string | number | Date | null): {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
} {
  const targetMs = target ? new Date(target).getTime() : null
  const [remaining, setRemaining] = useState<number>(() =>
    targetMs ? Math.max(0, targetMs - Date.now()) : 0,
  )

  useEffect(() => {
    if (!targetMs) return
    const update = () => setRemaining(Math.max(0, targetMs - Date.now()))
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [targetMs])

  const totalSeconds = Math.floor(remaining / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isExpired: remaining <= 0,
  }
}

/** True while the user is online, with automatic reconnect detection. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

/** Enumerate available media devices; gracefully degrades in insecure contexts. */
export function useMediaDevices(): {
  audioInputs: MediaDeviceInfo[]
  audioOutputs: MediaDeviceInfo[]
  videoInputs: MediaDeviceInfo[]
  error: string | null
} {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
        stream.getTracks().forEach((t) => t.stop())
        const all = await navigator.mediaDevices.enumerateDevices()
        if (mounted) setDevices(all)
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Devices unavailable')
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  return {
    audioInputs: devices.filter((d) => d.kind === 'audioinput'),
    audioOutputs: devices.filter((d) => d.kind === 'audiooutput'),
    videoInputs: devices.filter((d) => d.kind === 'videoinput'),
    error,
  }
}

/**
 * Simulated peer speaking activity. Returns a list of participant ids
 * that are currently "speaking" and periodically rotates them — mirrors
 * the WebRTC active-speaker API surface.
 */
export function useSimulatedSpeakers(participantIds: string[], intervalMs = 3200): Set<string> {
  const [speakers, setSpeakers] = useState<Set<string>>(new Set())
  const idsRef = useRef(participantIds)
  idsRef.current = participantIds

  useEffect(() => {
    const interval = window.setInterval(() => {
      const ids = idsRef.current
      if (ids.length === 0) return
      const next = new Set<string>()
      const count = 1 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        const pick = ids[Math.floor(Math.random() * ids.length)]
        if (pick) next.add(pick)
      }
      setSpeakers(next)
    }, intervalMs)
    return () => window.clearInterval(interval)
  }, [intervalMs])

  return speakers
}