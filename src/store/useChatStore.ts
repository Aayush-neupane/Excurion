import { create } from 'zustand'
import type { ChatMessage, TypingState } from '@/types/chat'
import { chatApi } from '@/api/chat.api'

interface ChatState {
  messages: ChatMessage[]
  unsubscribeRealtime: (() => void) | null
  typingUsers: TypingState[]
  isTyping: boolean
  unreadCount: number
  lastReadAt: string | null
  isLoading: boolean
  hasError: boolean
  load: (meetingId: string) => Promise<void>
  send: (meetingId: string, content: string) => Promise<void>
  setTyping: (typing: boolean) => void
  simulateIncomingTyping: () => void
  markAllRead: () => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  unsubscribeRealtime: null,
  typingUsers: [],
  isTyping: false,
  unreadCount: 0,
  lastReadAt: null,
  isLoading: false,
  hasError: false,

  async load(meetingId) {
    set({ isLoading: true, hasError: false })
    try {
      const messages = await chatApi.getMessages(meetingId)
      set({ messages, isLoading: false, lastReadAt: new Date().toISOString() })
      get().unsubscribeRealtime?.()
      const unsubscribe = await chatApi.subscribeMessages(meetingId, (message) => {
        const state = get()
        if (state.messages.some((m) => m.id === message.id)) return
        set({ messages: [...state.messages, message], unreadCount: state.unreadCount + 1 })
      })
      set({ unsubscribeRealtime: unsubscribe })
    } catch {
      set({ isLoading: false, hasError: true })
    }
  },

  async send(meetingId, content) {
    const message = await chatApi.sendMessage({ meetingId, content })
    set((s) => ({ messages: [...s.messages, message] }))
  },

  setTyping: (typing) => {
    const { isTyping, lastReadAt } = get()
    if (typing === isTyping) return
    set({ isTyping: typing })
    if (typing) {
      set({ unreadCount: lastReadAt ? 0 : get().unreadCount })
    }
  },

  simulateIncomingTyping: () => {
    const now = Date.now()
    const simulated: TypingState = {
      userId: 'u-3',
      userName: 'Peter Parker',
      until: now + 3500,
    }
    set((s) => ({
      typingUsers: [...s.typingUsers.filter((t) => t.userId !== simulated.userId), simulated],
    }))
    setTimeout(() => {
      set((s) => ({
        typingUsers: s.typingUsers.filter((t) => t.until > Date.now()),
      }))
    }, 3600)
  },

  markAllRead: () => set({ unreadCount: 0, lastReadAt: new Date().toISOString() }),

  reset: () => {
    get().unsubscribeRealtime?.()
    set({
      unsubscribeRealtime: null,
      messages: [],
      typingUsers: [],
      isTyping: false,
      unreadCount: 0,
      lastReadAt: null,
      isLoading: false,
      hasError: false,
    })
  },
}))

export function useMessages(): ChatMessage[] {
  return useChatStore((s) => s.messages)
}

export function useUnreadCount(): number {
  return useChatStore((s) => s.unreadCount)
}