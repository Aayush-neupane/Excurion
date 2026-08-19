/**
 * Central API barrel.
 *
 * Every feature imports from here. When the real backend ships, replace
 * each `mock*Api` with the real implementation in `api/*.real.ts` files
 * (axios / fetch + JWT interceptors) behind the identical interface.
 */
export { authApi, createSession } from './auth.api'
export type { AuthApi } from './auth.api'
export { meetingApi } from './meeting.api'
export type { MeetingApi } from './meeting.api'
export { chatApi } from './chat.api'
export type { ChatApi } from './chat.api'
export { whiteboardApi } from './whiteboard.api'
export type { WhiteboardApi } from './whiteboard.api'
export { notificationApi } from './notification.api'
export type { NotificationApi } from './notification.api'
export { profileApi } from './profile.api'
export type { ProfileApi } from './profile.api'
export { mockResult, simulateLatency, randomId, randomRoomCode } from './client'