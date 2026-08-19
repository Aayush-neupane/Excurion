import type { ChatMessage, SendMessageInput, TypingState } from '@/types/chat'
import { mockChatMessages } from '@/data/chat'
import { mockError, mockResult, randomId } from './client'

export interface ChatApi {
  getMessages(meetingId: string): Promise<ChatMessage[]>
  sendMessage(input: SendMessageInput): Promise<ChatMessage>
  getTypingUsers(meetingId: string): Promise<TypingState[]>
  markMessagesRead(meetingId: string): Promise<void>
}

export const mockChatApi: ChatApi = {
  async getMessages(meetingId) {
    const messages = mockChatMessages.filter((m) => m.meetingId === meetingId)
    return mockResult(messages, 500)
  },

  async sendMessage({ meetingId, content, attachment }) {
    if (!content.trim() && !attachment) {
      return mockError('Message cannot be empty.')
    }
    const message: ChatMessage = {
      id: randomId('c'),
      meetingId,
      authorId: 'u-1',
      authorName: 'Tony Stark (You)',
      content: content.trim(),
      attachment: attachment ? { ...attachment, id: randomId('at') } : undefined,
      createdAt: new Date().toISOString(),
    }
    return mockResult(message, 200)
  },

  async getTypingUsers() {
    return mockResult([])
  },

  async markMessagesRead() {
    return mockResult(undefined, 80)
  },
}

export const chatApi: ChatApi = mockChatApi