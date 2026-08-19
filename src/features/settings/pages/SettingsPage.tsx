import { motion } from 'framer-motion'
import {
  Accessibility,
  AudioLines,
  Globe,
  Keyboard,
  Monitor,
  Bell,
  Video,
} from 'lucide-react'
import type { ThemeMode } from '@/types/settings'
import { LANGUAGES } from '@/types/settings'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useThemeContext } from '@/app/providers/theme-provider'
import { useMediaDevices } from '@/hooks'
import { KEYBOARD_SHORTCUTS } from '@/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const TABS = [
  { value: 'appearance', label: 'Appearance', icon: Monitor },
  { value: 'audio', label: 'Audio', icon: AudioLines },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { value: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard },
  { value: 'language', label: 'Language', icon: Globe },
] as const

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl">
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              <tab.icon className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
        <TabsContent value="audio">
          <AudioSettings />
        </TabsContent>
        <TabsContent value="video">
          <VideoSettings />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsSettings />
        </TabsContent>
        <TabsContent value="accessibility">
          <AccessibilitySettings />
        </TabsContent>
        <TabsContent value="shortcuts">
          <ShortcutsSettings />
        </TabsContent>
        <TabsContent value="language">
          <LanguageSettings />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  )
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">{children}</div>
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <SettingRow title={title} description={description}>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </SettingRow>
  )
}

function AppearanceSettings() {
  const appearance = useSettingsStore((s) => s.settings.appearance)
  const update = useSettingsStore((s) => s.update)
  const { mode, set } = useThemeContext()

  const selectTheme = (next: ThemeMode) => {
    set(next)
    update('appearance', { theme: next })
    toast.success(`Theme set to ${next}`, { duration: 1200 })
  }

  return (
    <div className="space-y-6">
      <Section title="Theme" description="Personalize how Excurion looks on this device.">
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme mode">
          {(['dark', 'light', 'system'] as const).map((t) => {
            const active = mode === t
            return (
              <button
                key={t}
                role="radio"
                aria-checked={active}
                onClick={() => selectTheme(t)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                  active
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : 'border-border hover:bg-accent',
                )}
              >
                <span
                  className={cn(
                    'block h-14 w-full rounded-lg border border-border/60 bg-background',
                    t === 'dark' && 'bg-gradient-to-b from-zinc-400 to-zinc-800',
                    t === 'light' && 'bg-gradient-to-b from-white to-zinc-200',
                    t === 'system' && 'bg-gradient-to-b from-zinc-100 to-zinc-700',
                  )}
                  aria-hidden
                />
                <span className="text-xs font-medium capitalize">{t}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Display" description="Adjust density and effects.">
        <ToggleRow
          title="Reduce transparency"
          description="Disable frosted-glass effects for better legibility."
          checked={appearance.reduceTransparency}
          onChange={(v) => update('appearance', { reduceTransparency: v })}
        />
        <ToggleRow
          title="Compact mode"
          description="Use tighter spacing throughout the interface."
          checked={appearance.compactMode}
          onChange={(v) => update('appearance', { compactMode: v })}
        />
      </Section>
    </div>
  )
}

function AudioSettings() {
  const audio = useSettingsStore((s) => s.settings.audio)
  const update = useSettingsStore((s) => s.update)
  const { audioInputs, audioOutputs, error } = useMediaDevices()

  return (
    <Section
      title="Audio"
      description="Manage your microphone and speaker preferences."
    >
      <SettingRow title="Microphone" description="The device used to capture your voice.">
        <Select value={audio.inputDevice} onValueChange={(v) => update('audio', { inputDevice: v })}>
          <SelectTrigger className="w-52" aria-label="Microphone device">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {audioInputs.map((d) => (
              <SelectItem key={d.deviceId} value={d.deviceId}>
                {d.label || 'Default microphone'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      {error && (
        <p className="text-xs text-destructive">
          Could not access media devices — grant camera/mic permission in your browser.
        </p>
      )}

      <SettingRow title="Speaker" description="The device audio plays through.">
        <Select value={audio.outputDevice} onValueChange={(v) => update('audio', { outputDevice: v })}>
          <SelectTrigger className="w-52" aria-label="Speaker device">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {audioOutputs.map((d) => (
              <SelectItem key={d.deviceId} value={d.deviceId}>
                {d.label || 'Default speaker'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow title="Input volume" description={`${audio.inputVolume}%`}>
        <input
          type="range"
          min={0}
          max={100}
          value={audio.inputVolume}
          onChange={(e) => update('audio', { inputVolume: Number(e.target.value) })}
          aria-label="Input volume"
          className="w-48 accent-primary"
        />
      </SettingRow>

      <SettingRow title="Output volume" description={`${audio.outputVolume}%`}>
        <input
          type="range"
          min={0}
          max={100}
          value={audio.outputVolume}
          onChange={(e) => update('audio', { outputVolume: Number(e.target.value) })}
          aria-label="Output volume"
          className="w-48 accent-primary"
        />
      </SettingRow>

      <div className="space-y-1 border-t border-border pt-4">
        <ToggleRow
          title="Echo cancellation"
          description="Reduces echo from speakers automatically."
          checked={audio.echoCancellation}
          onChange={(v) => update('audio', { echoCancellation: v })}
        />
        <ToggleRow
          title="Noise suppression"
          description="Filters out background noise like fans and keyboards."
          checked={audio.noiseSuppression}
          onChange={(v) => update('audio', { noiseSuppression: v })}
        />
        <ToggleRow
          title="Automatic gain control"
          description="Keeps your voice level consistent."
          checked={audio.autoGainControl}
          onChange={(v) => update('audio', { autoGainControl: v })}
        />
      </div>
    </Section>
  )
}

function VideoSettings() {
  const video = useSettingsStore((s) => s.settings.video)
  const update = useSettingsStore((s) => s.update)
  const { videoInputs, error } = useMediaDevices()

  return (
    <Section title="Video" description="Choose your camera and video behavior.">
      <SettingRow title="Camera" description="The camera used for your video feed.">
        <Select value={video.cameraDevice} onValueChange={(v) => update('video', { cameraDevice: v })}>
          <SelectTrigger className="w-60" aria-label="Camera device">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {videoInputs.map((d) => (
              <SelectItem key={d.deviceId} value={d.deviceId}>
                {d.label || 'Default camera'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      {error && (
        <p className="text-xs text-destructive">
          Could not access your camera — check browser permissions.
        </p>
      )}

      <SettingRow title="Resolution" description="Preferred capture resolution.">
        <Select value={video.resolution} onValueChange={(v) => update('video', { resolution: v as '720p' | '1080p' })}>
          <SelectTrigger className="w-28" aria-label="Video resolution">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">720p</SelectItem>
            <SelectItem value="1080p">1080p</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <ToggleRow
        title="Camera on by default"
        description="Turn your camera on automatically when joining a room."
        checked={video.cameraEnabledByDefault}
        onChange={(v) => update('video', { cameraEnabledByDefault: v })}
      />
      <ToggleRow
        title="Mirror my preview"
        description="Show your self view as a mirror image."
        checked={video.mirrorPreview}
        onChange={(v) => update('video', { mirrorPreview: v })}
      />
      <ToggleRow
        title="Background blur"
        description="Blur your background during calls (device dependent)."
        checked={video.backgroundBlur}
        onChange={(v) => update('video', { backgroundBlur: v })}
      />
    </Section>
  )
}

function NotificationsSettings() {
  const notifications = useSettingsStore((s) => s.settings.notifications)
  const update = useSettingsStore((s) => s.update)

  return (
    <Section title="Notifications" description="Choose what you want to hear about.">
      <ToggleRow
        title="Meeting reminders"
        description="Reminders before classes and office hours."
        checked={notifications.meetingReminders}
        onChange={(v) => update('notifications', { meetingReminders: v })}
      />
      <ToggleRow
        title="Chat messages"
        description="Alert me about new messages in an active room."
        checked={notifications.chatMessages}
        onChange={(v) => update('notifications', { chatMessages: v })}
      />
      <ToggleRow
        title="Raised hands"
        description="Notify me when a student raises their hand."
        checked={notifications.raisedHands}
        onChange={(v) => update('notifications', { raisedHands: v })}
      />
      <ToggleRow
        title="Recording ready"
        description="Let me know when a recording finishes processing."
        checked={notifications.recordings}
        onChange={(v) => update('notifications', { recordings: v })}
      />
      <ToggleRow
        title="Weekly digest"
        description="A summary of your teaching week, every Monday."
        checked={notifications.weeklyDigest}
        onChange={(v) => update('notifications', { weeklyDigest: v })}
      />
      <ToggleRow
        title="Product updates"
        description="Occasional news about new features."
        checked={notifications.systemUpdates}
        onChange={(v) => update('notifications', { systemUpdates: v })}
      />
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Notification preferences saved')}
        >
          Save preferences
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toast.info('Demo simulated only')}>
          Test notification
        </Button>
      </div>
    </Section>
  )
}

function AccessibilitySettings() {
  const accessibility = useSettingsStore((s) => s.settings.accessibility)
  const update = useSettingsStore((s) => s.update)

  return (
    <Section title="Accessibility" description="Make Excurion work best for you.">
      <ToggleRow
        title="High contrast"
        description="Sharper contrast between elements and background."
        checked={accessibility.highContrast}
        onChange={(v) => update('accessibility', { highContrast: v })}
      />
      <ToggleRow
        title="Reduce motion"
        description="Minimize animations and transitions."
        checked={accessibility.reduceMotion}
        onChange={(v) => update('accessibility', { reduceMotion: v })}
      />
      <ToggleRow
        title="Reduce transparency"
        description="Remove translucent surfaces."
        checked={accessibility.reduceTransparency}
        onChange={(v) => update('accessibility', { reduceTransparency: v })}
      />
      <ToggleRow
        title="Live captions"
        description="Show live captions for who is speaking (preview)."
        checked={accessibility.captionsEnabled}
        onChange={(v) => update('accessibility', { captionsEnabled: v })}
      />
      <SettingRow title="Caption size" description="Adjust caption text size.">
        <Select
          value={accessibility.captionsSize}
          onValueChange={(v) => update('accessibility', { captionsSize: v as 'small' | 'medium' | 'large' })}
        >
          <SelectTrigger className="w-28" aria-label="Caption size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
    </Section>
  )
}

function groupShortcuts() {
  const groups = new Map<string, typeof KEYBOARD_SHORTCUTS>()
  for (const s of KEYBOARD_SHORTCUTS) {
    const list = groups.get(s.section) ?? []
    list.push(s)
    groups.set(s.section, list)
  }
  return Array.from(groups.entries())
}

function ShortcutsSettings() {
  return (
    <Section title="Keyboard shortcuts" description="Move fast with your keyboard.">
      {groupShortcuts().map(([section, items]) => (
        <div key={section} className="space-y-1">
          <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section}
          </p>
          <div className="divide-y divide-border rounded-lg border border-border">
            {items.map((s) => (
              <div
                key={s.keys}
                className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-sm"
              >
                <span className="text-muted-foreground">{s.description}</span>
                <kbd className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-[11px]">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Section>
  )
}

function LanguageSettings() {
  const language = useSettingsStore((s) => s.settings.language)
  const update = useSettingsStore((s) => s.update)
  const [preview, setPreview] = useState(language)

  return (
    <Section title="Language" description="Choose your interface language.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LANGUAGES.map((lang) => {
          const active = preview === lang.code
          return (
            <Tooltip key={lang.code}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setPreview(lang.code)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-4 transition-all',
                    active ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent',
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {lang.code}
                  </span>
                  <span className="text-xs font-medium">
                    {lang.label}
                    {active && ' ✓'}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{lang.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Translations are a preview — English remains the fallback for untranslated strings.
      </p>
      <Button
        size="sm"
        onClick={() => {
          update('language', preview)
          toast.success('Language preference saved')
        }}
        disabled={preview === language}
      >
        Save language
      </Button>
    </Section>
  )
}