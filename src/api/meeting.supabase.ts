import type {
  ClassStatistics,
  CreateMeetingInput,
  CreateRoomResult,
  JoinMeetingInput,
  JoinRoomResult,
  Meeting,
  Participant,
} from '@/types/meeting'
import { getSupabase } from '@/lib/supabase/client'

interface RoomRow {
  id: string
  title: string
  description: string | null
  type: 'class' | '1on1' | 'webinar' | 'office-hours'
  subject: string | null
  room_code: string
  host_id: string
  status: 'live' | 'scheduled' | 'ended' | 'recording'
  scheduled_at: string | null
  duration_minutes: number | null
  recording_url: string | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}

const STALE_AFTER_MS = 95_000

interface ParticipantRow {
  id: string
  room_id: string
  user_id: string
  is_host: boolean
  last_seen_at: string | null
  mic: 'on' | 'off' | 'unavailable'
  camera: 'on' | 'off' | 'unavailable'
  screen_share: boolean
  speaking: boolean
  raised_hand: boolean
  connection: 'excellent' | 'good' | 'fair' | 'poor'
  joined_at: string
  status: 'active' | 'left' | 'removed'
  profiles?: {
    name: string
    role: 'student' | 'teacher' | 'admin'
    avatar_url: string | null
  } | null
}

function toMeeting(row: RoomRow, participantCount: number): Meeting {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    status: row.status,
    roomCode: row.room_code,
    hostId: row.host_id,
    subject: row.subject ?? undefined,
    scheduledAt: row.scheduled_at ?? undefined,
    duration: row.duration_minutes ?? undefined,
    participants: participantCount,
    recordingUrl: row.recording_url ?? undefined,
    startedAt: row.started_at ?? undefined,
    endedAt: row.ended_at ?? undefined,
  }
}

function toParticipant(row: ParticipantRow): Participant {
  const profile = row.profiles
  return {
    id: row.id,
    userId: row.user_id,
    name: profile?.name ?? 'Unknown',
    role: profile?.role === 'admin' ? 'teacher' : (profile?.role ?? 'student'),
    avatarUrl: profile?.avatar_url ?? undefined,
    isHost: row.is_host,
    mic: row.mic,
    camera: row.camera,
    screenShare: row.screen_share,
    speaking: row.speaking,
    raisedHand: row.raised_hand,
    connection: row.connection,
    joinedAt: row.joined_at,
  }
}

const ROOM_COLUMNS =
  'id, title, description, type, subject, room_code, host_id, status, scheduled_at, duration_minutes, recording_url, started_at, ended_at, created_at'

const PARTICIPANT_COLUMNS =
  'id, room_id, user_id, is_host, mic, camera, screen_share, speaking, raised_hand, connection, joined_at, status, last_seen_at, profiles(name, role, avatar_url)'

function isFresh(row: { status: string; last_seen_at: string | null }): boolean {
  if (row.status !== 'active') return false
  if (!row.last_seen_at) return true
  return Date.now() - new Date(row.last_seen_at).getTime() <= STALE_AFTER_MS
}

const functionsBaseUrl: string =
  import.meta.env.VITE_NETLIFY_FUNCTIONS_URL ?? `${window.location.origin}/.netlify/functions`

async function processMeetingAction(
  roomId: string,
  action: 'promote-host' | 'remove-participant',
  participantId?: string,
  targetUserId?: string,
): Promise<void> {
  const supabase = getSupabase()
  const { data: session } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('You are not signed in.')

  const res = await fetch(`${functionsBaseUrl}/process-meeting-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roomId, action, participantId, targetUserId }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error === 'not_host' ? 'Only the host can do this.' : body?.error ?? 'Action failed.')
  }
}

async function fetchParticipantCounts(roomIds: string[]): Promise<Map<string, number>> {
  if (roomIds.length === 0) return new Map()
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('participants')
    .select('room_id, status, last_seen_at')
    .in('room_id', roomIds)

  if (error) throw new Error(error.message)
  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    if (!isFresh(row)) continue
    counts.set(row.room_id, (counts.get(row.room_id) ?? 0) + 1)
  }
  return counts
}

function mapErrors(message: string): string {
  switch (message) {
    case 'ROOM_NOT_FOUND':
      return "We couldn't find a room with that code."
    case 'ROOM_NOT_OPEN':
      return 'This room is not open right now.'
    case 'ROOM_PRIVATE':
      return 'This is a private room. Ask the host for an invitation.'
    case 'ROOM_FULL':
      return 'This room is full. Please try again later.'
    case 'NOT_HOST':
      return 'Only the host can do this.'
    case 'Database error saving new client':
      return 'Something went wrong joining the room. Please try again.'
    default:
      return message
  }
}

/** Real Supabase implementation behind the existing MeetingApi contract. */
export const supabaseMeetingApi = {
  async listMeetings(): Promise<Meeting[]> {
    const supabase = getSupabase()
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select(ROOM_COLUMNS)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    const counts = await fetchParticipantCounts((rooms ?? []).map((r) => r.id))
    return (rooms ?? []).map((r) => toMeeting(r, counts.get(r.id) ?? 0))
  },

  async getMeeting(id: string): Promise<Meeting> {
    const supabase = getSupabase()
    const { data: room, error } = await supabase
      .from('rooms')
      .select(ROOM_COLUMNS)
      .eq('id', id)
      .single()

    if (error) throw new Error(mapErrors(error.message))
    if (!room) throw new Error('Meeting not found.')
    const counts = await fetchParticipantCounts([room.id])
    return toMeeting(room, counts.get(room.id) ?? 0)
  },

  async findMeetingByCode(roomCode: string): Promise<Meeting | null> {
    const supabase = getSupabase()
    const { data: room, error } = await supabase
      .from('rooms')
      .select(ROOM_COLUMNS)
      .eq('room_code', roomCode.trim().toLowerCase())
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!room) return null
    const counts = await fetchParticipantCounts([room.id])
    return toMeeting(room, counts.get(room.id) ?? 0)
  },

  async getUpcoming(): Promise<Meeting[]> {
    const supabase = getSupabase()
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select(ROOM_COLUMNS)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })

    if (error) throw new Error(error.message)
    const counts = await fetchParticipantCounts((rooms ?? []).map((r) => r.id))
    return (rooms ?? []).map((r) => toMeeting(r, counts.get(r.id) ?? 0))
  },

  async getRecent(): Promise<Meeting[]> {
    const supabase = getSupabase()
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select(ROOM_COLUMNS)
      .eq('status', 'ended')
      .order('ended_at', { ascending: false })
      .limit(4)

    if (error) throw new Error(error.message)
    const counts = await fetchParticipantCounts((rooms ?? []).map((r) => r.id))
    return (rooms ?? []).map((r) => toMeeting(r, counts.get(r.id) ?? 0))
  },

  async getStatistics(): Promise<ClassStatistics> {
    const supabase = getSupabase()
    const me = (await supabase.auth.getUser()).data.user?.id ?? ''

    const [{ data: myRooms }, { data: roster }] = await Promise.all([
      supabase.from('rooms').select('id, host_id, started_at, ended_at').eq('host_id', me),
      supabase
        .from('participants')
        .select('room_id, user_id, status')
        .in(
          'room_id',
          (await supabase.from('rooms').select('id').eq('host_id', me)).data?.map((r) => r.id) ?? [],
        ),
    ])
    const rooms = (myRooms ?? []).filter((r) => r.host_id === me)

    const totalClasses = rooms.length
    const totalMinutes = rooms.reduce((sum, r) => {
      if (!r.started_at || !r.ended_at) return sum
      return sum + Math.max(0, Math.round((new Date(r.ended_at).getTime() - new Date(r.started_at).getTime()) / 60_000))
    }, 0)

    const roomIds = new Set(rooms.map((r) => r.id))
    const students = new Set((roster ?? []).filter((p) => roomIds.has(p.room_id)).map((p) => p.user_id))
    const roomsWithStudents = new Set(
      (roster ?? []).filter((p) => roomIds.has(p.room_id) && p.status === 'left').map((p) => p.room_id),
    ).size
    const attendedCount = students.size
    const attendanceRate = rooms.length > 0 ? Math.round((roomsWithStudents / rooms.length) * 100) : 0

    const dayKeys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d
    })
    const byDay = new Map<string, { classes: number; attended: number }>()
    for (const d of dayKeys) {
      byDay.set(d.toDateString(), { classes: 0, attended: 0 })
    }
    const rosterByRoom = new Map<string, Set<string>>()
    for (const p of roster ?? []) {
      if (!roomIds.has(p.room_id) || p.user_id === me) continue
      if (!rosterByRoom.has(p.room_id)) rosterByRoom.set(p.room_id, new Set())
      rosterByRoom.get(p.room_id)!.add(p.user_id)
    }
    for (const r of rooms) {
      if (!r.started_at) continue
      const day = new Date(r.started_at).toDateString()
      const entry = byDay.get(day)
      if (entry) {
        entry.classes += 1
        if ((rosterByRoom.get(r.id)?.size ?? 0) > 0) entry.attended += 1
      }
    }

    return {
      totalClasses,
      totalMinutes,
      totalStudents: attendedCount,
      attendanceRate,
      weeklyAttendance: dayKeys.map((d) => ({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: (() => {
          const e = byDay.get(d.toDateString())
          return e && e.classes > 0 ? Math.round((e.attended / e.classes) * 100) : 0
        })(),
      })),
      weeklyActivity: dayKeys.map((d) => ({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        classes: byDay.get(d.toDateString())?.classes ?? 0,
      })),
    }
  },

  async getHostName(meetingId: string): Promise<string> {
    const meeting = await this.getMeeting(meetingId)
    const user = (await getSupabase().auth.getUser()).data.user
    if (meeting.hostId === user?.id) return 'You'
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('name')
      .eq('id', meeting.hostId)
      .maybeSingle()
    return profile?.name ?? 'Instructor'
  },

  async createRoom(input: CreateMeetingInput): Promise<CreateRoomResult> {
    const supabase = getSupabase()
    const { data: roomData, error } = await supabase.rpc('create_room', {
      p_title: input.title,
      p_description: input.description ?? null,
      p_type: input.type,
      p_subject: input.subject ?? null,
      p_privacy: 'private',
      p_scheduled_at: input.scheduledAt ?? null,
      p_duration_minutes: input.duration ?? null,
      p_participant_limit: 100,
    } as never)

    if (error) throw new Error(mapErrors(error.message))
    const rows = roomData as unknown as RoomRow[]
    const room = rows[0]
    if (!room) throw new Error('Room could not be created.')

    const { data: participants } = await supabase
      .from('participants')
      .select(PARTICIPANT_COLUMNS)
      .eq('room_id', room.id)

    return {
      meeting: toMeeting(room, 1),
      token: `rtc.${room.id}`,
      participants: (participants ?? []).map((p: ParticipantRow) => toParticipant(p)),
      inviteUrl: `${window.location.origin}/join?code=${room.room_code}`,
    }
  },

  async joinRoom({ roomCode }: JoinMeetingInput): Promise<JoinRoomResult> {
    const supabase = getSupabase()
    const { data: roomsData, error } = await supabase.rpc('join_room', { p_code: roomCode.trim().toLowerCase() })
    if (error) throw new Error(mapErrors(error.message))

    const room = (roomsData as unknown as RoomRow[])[0]
    if (!room) throw new Error('Room could not be joined.')
    const { data: participants } = await supabase
      .from('participants')
      .select(PARTICIPANT_COLUMNS)
      .eq('room_id', room.id)

    return {
      meeting: toMeeting(room, (participants ?? []).filter(isFresh).length),
      token: `rtc.${room.id}`,
      participants: (participants ?? []).map((p: ParticipantRow) => toParticipant(p)),
    }
  },

  async getParticipants(meetingId: string): Promise<Participant[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('participants')
      .select(PARTICIPANT_COLUMNS)
      .eq('room_id', meetingId)
      .order('joined_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []).filter(isFresh).map((p: ParticipantRow) => toParticipant(p))
  },

  async leaveRoom(meetingId: string): Promise<void> {
    const supabase = getSupabase()
    const { error } = await supabase.rpc('leave_room', { p_room_id: meetingId })
    if (error) throw new Error(error.message)
  },

  async endRoom(meetingId: string): Promise<void> {
    const supabase = getSupabase()
    const { error } = await supabase.rpc('end_room', { p_room_id: meetingId })
    if (error) throw new Error(mapErrors(error.message))
  },

  async heartbeat(meetingId: string): Promise<void> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return
    await supabase
      .from('participants')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('room_id', meetingId)
      .eq('user_id', user.id)
  },

  async promoteHost(roomId: string, targetUserId: string): Promise<void> {
    await processMeetingAction(roomId, 'promote-host', undefined, targetUserId)
  },

  async removeParticipant(participantId: string, roomId: string): Promise<void> {
    await processMeetingAction(roomId, 'remove-participant', participantId)
  },

  /** Live roster: fires on any participant change; signals when I'm removed. */
  async subscribeRoster(
    roomId: string,
    handlers: { onRosterChange: () => void; onSelfRemoved: () => void },
  ): Promise<() => void> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return () => {}

    const channel = supabase
      .channel(`roster-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            handlers.onRosterChange()
            return
          }
          const row = payload.new as { user_id: string; status: string }
          if (row.user_id === user.id && row.status === 'removed') handlers.onSelfRemoved()
          else handlers.onRosterChange()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  },
}