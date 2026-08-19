export const APP_NAME = 'Excurion'
export const APP_TAGLINE = 'Virtual Classroom'

export const APP_DESCRIPTION =
  'Excurion is a modern virtual classroom platform for live lessons, interactive whiteboards, and seamless collaboration.'

export const DEFAULT_AVATAR = undefined

export const MAX_CHAT_MESSAGE_LENGTH = 2000

export const MEETING_REFETCH_INTERVAL = 30_000

export const CHAT_PAGE_SIZE = 50

export const TYPING_INDICATOR_DURATION = 4000

export const STORAGE_KEYS = {
  session: 'excurion.session',
  theme: 'excurion.theme',
  settings: 'excurion.settings',
  language: 'excurion.language',
} as const

export const ROOM_CODE_REGEX = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i

export const KEYBOARD_SHORTCUTS: { keys: string; description: string; section: string }[] = [
  { section: 'General', keys: '⌘ /', description: 'Open command menu' },
  { section: 'General', keys: 'g d', description: 'Go to dashboard' },
  { section: 'General', keys: 'g n', description: 'Go to notifications' },
  { section: 'Meeting', keys: '⌘ d', description: 'Toggle microphone' },
  { section: 'Meeting', keys: '⌘ e', description: 'Toggle camera' },
  { section: 'Meeting', keys: '⌘ h', description: 'Raise / lower hand' },
  { section: 'Meeting', keys: '⌘ w', description: 'Toggle whiteboard' },
  { section: 'Meeting', keys: '⌘ c', description: 'Toggle chat' },
  { section: 'Meeting', keys: '⌘ s', description: 'Toggle participants' },
  { section: 'Meeting', keys: '⌘ x', description: 'Leave meeting' },
  { section: 'Whiteboard', keys: 'v', description: 'Select tool' },
  { section: 'Whiteboard', keys: 'd', description: 'Draw tool' },
  { section: 'Whiteboard', keys: 't', description: 'Text tool' },
  { section: 'Whiteboard', keys: '⌘ z', description: 'Undo' },
  { section: 'Whiteboard', keys: '⇧ ⌘ z', description: 'Redo' },
]