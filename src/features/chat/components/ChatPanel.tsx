import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Paperclip, SendHorizonal, Smile, X } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'
import { MAX_CHAT_MESSAGE_LENGTH } from '@/constants'
import { toast } from 'sonner'
import { useChatStore } from '@/store/useChatStore'
import { useCurrentUser } from '@/store/useUserStore'
import { useMeetingStore } from '@/store/useMeetingStore'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { formatTime } from '@/lib/utils'

const EMOJI_ROW = ['👍', '🙌', '🎉', '❤️', '🤔', '👏', '💡', '✅', '❓', '😄', '😅', '🔥']

function useAutoScroll(ref: React.RefObject<HTMLDivElement | null>, messages: ChatMessage[]) {
  const [autoScroll, setAutoScroll] = useState(true)
  useEffect(() => {
    if (!autoScroll) return
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, autoScroll, ref])
  return { autoScroll, setAutoScroll }
}

export function ChatPanel({ meetingId }: { meetingId: string }) {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const hasError = useChatStore((s) => s.hasError)
  const typingUsers = useChatStore((s) => s.typingUsers)
  const load = useChatStore((s) => s.load)
  const send = useChatStore((s) => s.send)
  const markAllRead = useChatStore((s) => s.markAllRead)
  const simulateIncomingTyping = useChatStore((s) => s.simulateIncomingTyping)

  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { autoScroll, setAutoScroll } = useAutoScroll(scrollRef, messages)
  const sidebarClose = useMeetingStore((s) => s.setSidebar)

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    try {
      await send(meetingId, content)
      setDraft('')
      window.setTimeout(() => simulateIncomingTyping(), 3500 + Math.random() * 2500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  useEffect(() => {
    if (autoScroll && messages.length > 0) markAllRead()
  }, [autoScroll, messages.length, markAllRead])

  const groups = useMemo(() => {
    const out: { authorId: string; authorName: string; messages: ChatMessage[] }[] = []
    for (const msg of messages) {
      const last = out[out.length - 1]
      const sameAuthor = last && last.authorId === msg.authorId
      const recent =
        last &&
        new Date(msg.createdAt).getTime() -
          new Date(last.messages[last.messages.length - 1].createdAt).getTime() <
          5 * 60_000
      if (sameAuthor && recent) {
        last.messages.push(msg)
      } else {
        out.push({ authorId: msg.authorId, authorName: msg.authorName, messages: [msg] })
      }
    }
    return out
  }, [messages])

  const isTypingNow = typingUsers.some((t) => t.until > Date.now())
  const typingNames = typingUsers.filter((t) => t.until > Date.now()).map((t) => t.userName)

  return (
    <section className="flex h-full flex-col" aria-label="Meeting chat">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-semibold">Chat</h2>
        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => sidebarClose('chat')}
          aria-label="Close chat panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : hasError ? (
        <ErrorState
          title="Could not load messages"
          onRetry={() => void load(meetingId)}
          className="m-3 flex-1"
        />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No messages yet"
          description="Say hello and get the conversation started."
          className="m-3 flex-1"
        />
      ) : (
        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget
            setAutoScroll(Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 40)
          }}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {groups.map((group) => (
            <ChatGroup key={group.messages[0].id} group={group} />
          ))}
          {isTypingNow && <TypingIndicator names={typingNames} />}
        </div>
      )}

      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-end gap-1.5 rounded-lg border border-border bg-muted/40 p-1.5 transition-colors focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-ring/40">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="iconSm" aria-label="Add emoji">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-64 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Emoji</p>
              <div className="grid grid-cols-6 gap-1">
                {EMOJI_ROW.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setDraft((d) => d + emoji)}
                    className="rounded-md p-1.5 text-lg transition-colors hover:bg-accent"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHAT_MESSAGE_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            aria-label="Message"
            className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />

          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Attach file"
            title="Attach file"
            onClick={() => toast.info('File upload will be enabled when the backend ships')}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button
            size="iconSm"
            onClick={() => void handleSend()}
            disabled={!draft.trim() || sending}
            aria-label="Send message"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
          {draft.length}/{MAX_CHAT_MESSAGE_LENGTH} · Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </section>
  )
}

interface ChatGroup {
  authorId: string
  authorName: string
  messages: ChatMessage[]
}

function ChatGroup({ group }: { group: ChatGroup }) {
  const user = useCurrentUser()
  const isSelf = group.authorId === user?.id
  const first = group.messages[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2.5 ${isSelf ? 'flex-row-reverse' : ''}`}
    >
      <UserAvatar name={stripYou(group.authorName)} className="h-8 w-8 shrink-0" />
      <div className={`min-w-0 max-w-[85%] ${isSelf ? 'text-right' : ''}`}>
        <div className={`flex items-baseline gap-2 px-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold">{stripYou(group.authorName)}</span>
          <span className="text-[11px] text-muted-foreground">
            {formatTime(first.createdAt)}
          </span>
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {group.messages.map((msg) => (
            <div
              key={msg.id}
              title={formatTime(msg.createdAt)}
              className={`inline-block max-w-full rounded-md px-3 py-2 text-left text-sm leading-relaxed ${
                isSelf
                  ? 'self-end bg-primary text-primary-foreground'
                  : 'self-start bg-muted text-foreground'
              }`}
            >
              {msg.attachment && (
                <div
                  className={`mb-1.5 flex items-center gap-2.5 rounded-md border px-2.5 py-2 ${
                    isSelf
                      ? 'border-primary-foreground/20 bg-primary-foreground/10'
                      : 'border-border bg-card/60'
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-card/40">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium">
                      {msg.attachment.name}
                    </span>
                    <span className={isSelf ? 'block text-[11px] opacity-70' : 'block text-[11px] text-muted-foreground'}>
                      {msg.attachment.size
                        ? `${(msg.attachment.size / 1024).toFixed(0)} KB`
                        : 'Attachment'}
                    </span>
                  </span>
                </div>
              )}
              {msg.content && <p className="break-words">{msg.content}</p>}
              {msg.edited && (
                <span className={`mt-0.5 block text-[10px] ${isSelf ? 'opacity-60' : 'text-muted-foreground'}`}>
                  edited
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function TypingIndicator({ names }: { names: string[] }) {
  return (
    <div className="flex items-center gap-2.5" aria-live="polite">
      <UserAvatar name={names[0] ?? 'Someone'} className="h-8 w-8 shrink-0 opacity-80" />
      <div className="flex items-center gap-2.5 rounded-md bg-muted px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">
          {names.join(', ')} {names.length > 1 ? 'are' : 'is'} typing…
        </span>
      </div>
    </div>
  )
}

function stripYou(name: string): string {
  return name.replace(' (You)', '')
}