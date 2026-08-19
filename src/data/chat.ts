import type { ChatMessage } from '@/types/chat'

const now = Date.now()
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString()

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'c-1',
    meetingId: 'm-1',
    authorId: 'u-3',
    authorName: 'Peter Parker',
    content: 'Good morning everyone! Ready for the derivatives review 🙌',
    createdAt: minutesAgo(38),
  },
  {
    id: 'c-2',
    meetingId: 'm-1',
    authorId: 'u-4',
    authorName: 'Bruce Banner',
    content: 'Could we go over the chain rule one more time?',
    createdAt: minutesAgo(31),
  },
  {
    id: 'c-3',
    meetingId: 'm-1',
    authorId: 'u-1',
    authorName: 'Tony Stark',
    content: 'Absolutely! Let me put up an example on the whiteboard.',
    createdAt: minutesAgo(30),
  },
  {
    id: 'c-4',
    meetingId: 'm-1',
    authorId: 'u-6',
    authorName: 'Wanda Maximoff',
    attachment: {
      id: 'at-1',
      kind: 'file',
      name: 'derivatives_cheatsheet.pdf',
      size: 248_000,
      mimeType: 'application/pdf',
    },
    content: 'Here’s the cheatsheet I made for tonight',
    createdAt: minutesAgo(24),
  },
  {
    id: 'c-5',
    meetingId: 'm-1',
    authorId: 'u-5',
    authorName: 'Natasha Romanoff',
    content: 'Thanks Wanda, this is super helpful! 🤩',
    createdAt: minutesAgo(22),
  },
  {
    id: 'c-6',
    meetingId: 'm-1',
    authorId: 'u-3',
    authorName: 'Peter Parker',
    content: 'For problem 3, do we use the product rule first?',
    createdAt: minutesAgo(9),
  },
  {
    id: 'c-7',
    meetingId: 'm-1',
    authorId: 'u-1',
    authorName: 'Tony Stark',
    content: 'Yes Peter — product rule first, then chain rule inside. 🎯',
    createdAt: minutesAgo(7),
  },
  {
    id: 'c-8',
    meetingId: 'm-1',
    authorId: 'u-8',
    authorName: 'Steve Rogers',
    content: 'Got it, thanks!',
    createdAt: minutesAgo(5),
  },
]

export const mockReplies: string[] = [
  'Great point! 👍',
  'Can you repeat that please?',
  'Thanks for explaining!',
  'That makes so much more sense now.',
  'I have a question about this.',
  'Nice example!',
  'Could we see the graph again?',
  'Understood ✅',
]

export const mockParticipantsNames: string[] = [
  'Peter Parker',
  'Bruce Banner',
  'Natasha Romanoff',
  'Wanda Maximoff',
  'Carol Danvers',
  'Steve Rogers',
  'Clint Barton',
  'Shuri',
]