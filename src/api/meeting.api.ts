import type {
  ClassStatistics,
  CreateMeetingInput,
  CreateRoomResult,
  JoinMeetingInput,
  JoinRoomResult,
  Meeting,
  Participant,
} from '@/types/meeting'
import {
  getHostName,
  getMeetingByRoomCode,
  getMeetingById,
  mockClassStatistics,
  mockMeetings,
  mockParticipants,
} from '@/data/meetings'
import { mockError, mockResult, randomId, randomRoomCode } from './client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { supabaseMeetingApi } from './meeting.supabase'

export interface MeetingApi {
  listMeetings(): Promise<Meeting[]>
  getMeeting(id: string): Promise<Meeting>
  getRoomByCode(roomCode: string): Promise<Meeting | null>
  findMeetingByCode(roomCode: string): Promise<Meeting | null>
  getUpcoming(): Promise<Meeting[]>
  getRecent(): Promise<Meeting[]>
  getStatistics(): Promise<ClassStatistics>
  getHostName(meetingId: string): Promise<string>
  createRoom(input: CreateMeetingInput): Promise<CreateRoomResult>
  joinRoom(input: JoinMeetingInput): Promise<JoinRoomResult>
  getParticipants(meetingId: string): Promise<Participant[]>
  leaveRoom(meetingId: string): Promise<void>
  endRoom(meetingId: string): Promise<void>
  heartbeat(meetingId: string): Promise<void>
  promoteHost(roomId: string, targetUserId: string): Promise<void>
  removeParticipant(participantId: string, roomId: string): Promise<void>
  subscribeRoster(
    roomId: string,
    handlers: { onRosterChange: () => void; onSelfRemoved: () => void },
  ): Promise<() => void>
}

export const mockMeetingApi: MeetingApi = {
  async listMeetings() {
    return mockResult(mockMeetings)
  },

  async getMeeting(id) {
    const meeting = getMeetingById(id)
    if (!meeting) return mockError('Meeting not found.')
    return mockResult(meeting)
  },

  async findMeetingByCode(roomCode) {
    const meeting = getMeetingByRoomCode(roomCode)
    return mockResult(meeting ?? null)
  },

  async getUpcoming() {
    return mockResult(
      mockMeetings
        .filter((m) => m.status === 'scheduled' && m.scheduledAt)
        .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()),
    )
  },

  async getRecent() {
    return mockResult(
      mockMeetings
        .filter((m) => m.status === 'ended')
        .sort((a, b) => new Date(b.endedAt ?? 0).getTime() - new Date(a.endedAt ?? 0).getTime())
        .slice(0, 4),
    )
  },

  async getStatistics() {
    return mockResult(mockClassStatistics)
  },

  async getHostName(meetingId) {
    const meeting = getMeetingById(meetingId)
    return mockResult(meeting ? getHostName(meeting) : 'Instructor')
  },

  async createRoom(input) {
    if (!input.title.trim()) return mockError('Please give your room a title.')
    const meeting: Meeting = {
      id: randomId('m'),
      title: input.title.trim(),
      description: input.description?.trim(),
      type: input.type,
      status: 'live',
      roomCode: randomRoomCode(),
      hostId: 'u-1',
      subject: input.subject,
      scheduledAt: input.scheduledAt,
      duration: input.duration,
      participants: 1,
      startedAt: new Date().toISOString(),
    }
    const participants: Participant[] = [
      {
        id: 'p-self',
        userId: 'u-1',
        name: 'Tony Stark (You)',
        role: 'teacher',
        isHost: true,
        mic: 'on',
        camera: 'on',
        screenShare: false,
        speaking: false,
        raisedHand: false,
        connection: 'excellent',
        joinedAt: new Date().toISOString(),
      },
    ]
    return mockResult(
      {
        meeting,
        token: `rtc.${randomId('token')}`,
        participants,
        inviteUrl: `${window.location.origin}/join?code=${meeting.roomCode}`,
      },
      1100,
    )
  },

  async getRoomByCode(roomCode) {
    return mockResult(getMeetingByRoomCode(roomCode.toLowerCase()) ?? null, 300)
  },

  async joinRoom({ roomCode }) {
    const normalized = roomCode.trim().toLowerCase()
    const meeting = getMeetingByRoomCode(normalized)
    if (!meeting) {
      return mockError('We couldn’t find a meeting with that code.')
    }
    return mockResult({
      meeting,
      token: `rtc.${randomId('token')}`,
      participants: mockParticipants[meeting.id] ?? [],
    })
  },

  async getParticipants(meetingId) {
    return mockResult(mockParticipants[meetingId] ?? FALLBACK_PARTICIPANTS)
  },

  async leaveRoom() {
    return mockResult(undefined, 400)
  },

  async endRoom() {
    return mockResult(undefined, 400)
  },

  async heartbeat() {
    return mockResult(undefined, 100)
  },

  async promoteHost(roomId, _targetUserId) {
    const meeting = getMeetingById(roomId)
    if (!meeting) return mockError('Meeting not found.')
    return mockResult(undefined, 500)
  },

  async removeParticipant() {
    return mockResult(undefined, 500)
  },

  async subscribeRoster() {
    return mockResult(() => {}, 50)
  },
}

const supabaseMeetsContract: MeetingApi = supabaseMeetingApi

export const meetingApi: MeetingApi = isSupabaseConfigured()
  ? supabaseMeetsContract
  : mockMeetingApi

const nowIso = () => new Date().toISOString()

/** Rooms without a hand-picked roster still get a plausible class. */
const FALLBACK_PARTICIPANTS: Participant[] = [
  {
    id: 'p-self',
    userId: 'u-1',
    name: 'Tony Stark (You)',
    role: 'teacher',
    isHost: true,
    mic: 'on',
    camera: 'on',
    screenShare: false,
    speaking: false,
    raisedHand: false,
    connection: 'excellent',
    joinedAt: nowIso(),
  },
  {
    id: 'p-2',
    userId: 'u-2',
    name: 'Stephen Strange',
    role: 'student',
    isHost: false,
    mic: 'on',
    camera: 'on',
    screenShare: false,
    speaking: false,
    raisedHand: false,
    connection: 'good',
    joinedAt: nowIso(),
  },
  {
    id: 'p-3',
    userId: 'u-3',
    name: 'Peter Parker',
    role: 'student',
    isHost: false,
    mic: 'on',
    camera: 'off',
    screenShare: false,
    speaking: false,
    raisedHand: false,
    connection: 'good',
    joinedAt: nowIso(),
  },
  {
    id: 'p-4',
    userId: 'u-4',
    name: 'Bruce Banner',
    role: 'student',
    isHost: false,
    mic: 'off',
    camera: 'on',
    screenShare: false,
    speaking: false,
    raisedHand: false,
    connection: 'fair',
    joinedAt: nowIso(),
  },
]

/** Convenience for UI copy: display the host name for a meeting. */
export function meetingHostName(id: string): string {
  const meeting = getMeetingById(id)
  return meeting ? getHostName(meeting) : 'Instructor'
}