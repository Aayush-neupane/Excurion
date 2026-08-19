import type { ID, ConnectionQuality, DeviceState, Role } from './user'

export type MeetingStatus = 'live' | 'scheduled' | 'ended' | 'recording'

export type MeetingType = 'class' | '1on1' | 'webinar' | 'office-hours'

export interface Meeting {
  id: ID
  title: string
  description?: string
  type: MeetingType
  status: MeetingStatus
  roomCode: string
  hostId: ID
  subject?: string
  scheduledAt?: string
  duration?: number
  participants: number
  recordingUrl?: string
  startedAt?: string
  endedAt?: string
}

export interface CreateMeetingInput {
  title: string
  description?: string
  type: MeetingType
  subject?: string
  scheduledAt?: string
  duration?: number
}

export interface JoinMeetingInput {
  roomCode: string
  displayName?: string
}

export interface ParticipantMedia {
  mic: DeviceState
  camera: DeviceState
  screenShare: boolean
}

export interface Participant extends ParticipantMedia {
  id: ID
  userId?: ID
  name: string
  role: Role
  avatarUrl?: string
  isHost: boolean
  speaking: boolean
  raisedHand: boolean
  connection: ConnectionQuality
  joinedAt: string
}

export interface ClassStatistics {
  totalClasses: number
  totalMinutes: number
  totalStudents: number
  attendanceRate: number
  weeklyAttendance: { day: string; rate: number }[]
  weeklyActivity: { day: string; classes: number }[]
}

export interface ActivityItem {
  id: ID
  type: 'meeting' | 'chat' | 'recording' | 'participant' | 'system'
  message: string
  createdAt: string
}

export interface JoinRoomResult {
  meeting: Meeting
  token: string
  participants: Participant[]
}

export interface CreateRoomResult extends JoinRoomResult {
  inviteUrl: string
}