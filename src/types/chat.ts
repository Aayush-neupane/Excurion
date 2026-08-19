import type { ID } from './user'

export type ChatAttachmentKind = 'file' | 'image' | 'link'

export interface ChatAttachment {
  id: ID
  kind: ChatAttachmentKind
  name: string
  size?: number
  url?: string
  mimeType?: string
}

export interface ChatMessage {
  id: ID
  meetingId: ID
  authorId: ID
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: string
  attachment?: ChatAttachment
  edited?: boolean
}

export interface SendMessageInput {
  meetingId: ID
  content: string
  attachment?: Omit<ChatAttachment, 'id'>
}

export interface TypingState {
  userId: ID
  userName: string
  until: number
}