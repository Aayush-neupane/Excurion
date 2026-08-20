import type { ChatMessage, SendMessageInput, TypingState } from '@/types/chat'
import { getSupabase } from '@/lib/supabase/client'

interface MessageRow {
  id: string
  room_id: string
  author_id: string
  content: string
  metadata: Record<string, unknown>
  status: 'active' | 'edited' | 'deleted'
  created_at: string
  edited_at: string | null
  profiles?: { name: string; avatar_url: string | null } | null
}

const MESSAGE_SELECT =
  'id, room_id, author_id, content, metadata, status, created_at, edited_at, profiles(name, avatar_url)'

function toChatMessage(row: MessageRow): ChatMessage {
  const meta = row.metadata ?? {}
  return {
    id: row.id,
    meetingId: row.room_id,
    authorId: row.author_id,
    authorName: row.profiles?.name ?? 'Unknown',
    authorAvatar: row.profiles?.avatar_url ?? undefined,
    content: row.content,
    createdAt: row.created_at,
    attachment: meta.attachment as ChatMessage['attachment'],
    edited: row.status === 'edited',
  }
}

export const supabaseChatApi = {
  async getMessages(
    meetingId: string,
    opts: { limit?: number; before?: string } = {},
  ): Promise<ChatMessage[]> {
    const supabase = getSupabase()
    const limit = opts.limit ?? 50
    let query = supabase
      .from('messages')
      .select(MESSAGE_SELECT)
      .eq('room_id', meetingId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (opts.before) {
      query = query.lt('created_at', opts.before)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []).reverse().map(toChatMessage)
  },

  async sendMessage(input: SendMessageInput): Promise<ChatMessage> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: input.meetingId,
        content: input.content.trim(),
        metadata: input.attachment ? { attachment: input.attachment } : {},
      })
      .select(MESSAGE_SELECT)
      .single()

    if (error) throw new Error(error.message)
    return toChatMessage(data)
  },

  async getTypingUsers(): Promise<TypingState[]> {
    return []
  },

  async markMessagesRead(meetingId: string): Promise<void> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return
    const { error } = await supabase
      .from('participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', meetingId)
      .eq('user_id', user.id)
    if (error) throw new Error(error.message)
  },
}