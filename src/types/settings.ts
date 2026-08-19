export type ThemeMode = 'dark' | 'light' | 'system'

export type Language = 'en' | 'es' | 'de' | 'fr' | 'hi' | 'ja'

export interface AppearanceSettings {
  theme: ThemeMode
  reduceMotion: boolean
  reduceTransparency: boolean
  compactMode: boolean
  density: 'comfortable' | 'compact'
}

export interface AudioSettings {
  inputDevice: string
  outputDevice: string
  inputVolume: number
  outputVolume: number
  echoCancellation: boolean
  noiseSuppression: boolean
  autoGainControl: boolean
}

export interface VideoSettings {
  cameraDevice: string
  cameraEnabledByDefault: boolean
  mirrorPreview: boolean
  backgroundBlur: boolean
  resolution: '720p' | '1080p'
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  inApp: boolean
  meetingReminders: boolean
  chatMessages: boolean
  raisedHands: boolean
  recordings: boolean
  weeklyDigest: boolean
  systemUpdates: boolean
}

export interface AccessibilitySettings {
  highContrast: boolean
  reduceMotion: boolean
  reduceTransparency: boolean
  captionsEnabled: boolean
  captionsSize: 'small' | 'medium' | 'large'
  flashScreenOnSpeaking: boolean
}

export interface SettingsState {
  appearance: AppearanceSettings
  audio: AudioSettings
  video: VideoSettings
  notifications: NotificationSettings
  accessibility: AccessibilitySettings
  language: Language
}

export const DEFAULT_SETTINGS: SettingsState = {
  appearance: {
    theme: 'system',
    reduceMotion: false,
    reduceTransparency: false,
    compactMode: false,
    density: 'comfortable',
  },
  audio: {
    inputDevice: 'default',
    outputDevice: 'default',
    inputVolume: 80,
    outputVolume: 80,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    cameraDevice: 'default',
    cameraEnabledByDefault: true,
    mirrorPreview: true,
    backgroundBlur: false,
    resolution: '720p',
  },
  notifications: {
    email: true,
    push: true,
    inApp: true,
    meetingReminders: true,
    chatMessages: true,
    raisedHands: true,
    recordings: true,
    weeklyDigest: false,
    systemUpdates: true,
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    reduceTransparency: false,
    captionsEnabled: false,
    captionsSize: 'medium',
    flashScreenOnSpeaking: false,
  },
  language: 'en',
}

export interface MediaDevice {
  id: string
  label: string
  kind: 'audioinput' | 'audiooutput' | 'videoinput'
}

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ja', label: '日本語' },
]