import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, Check, Mail, MapPin, School, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { profileApi } from '@/api'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { UserAvatar } from '@/components/common/UserAvatar'

const TIMEZONES = [
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'America/Chicago', value: 'America/Chicago' },
  { label: 'America/Denver', value: 'America/Denver' },
  { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Paris', value: 'Europe/Paris' },
  { label: 'Europe/Berlin', value: 'Europe/Berlin' },
  { label: 'Europe/Madrid', value: 'Europe/Madrid' },
  { label: 'Europe/Dublin', value: 'Europe/Dublin' },
  { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
  { label: 'Asia/Seoul', value: 'Asia/Seoul' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
]

export default function ProfilePage() {
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser)
  const queryClient = useQueryClient()
  const [firstName, setFirstName] = useState(user?.name.split(' ')[0] ?? '')
  const [lastName, setLastName] = useState(user?.name.split(' ').slice(1).join(' ') ?? '')
  const [title, setTitle] = useState(user?.title ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [timezone, setTimezone] = useState(user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      profileApi.updateProfile({
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        title: title.trim(),
        bio: bio.trim(),
        timezone,
        notificationEmail: emailNotifications,
        notificationPush: pushNotifications,
      }),
    onSuccess: (updated) => {
      setUser(updated)
      void queryClient.setQueryData(['profile'], updated)
      toast.success('Profile updated')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleAvatarUpload = (file: File) => {
    setIsUploading(true)
    profileApi
      .uploadAvatar(file)
      .then(({ avatarUrl }) => {
        if (profile) {
          const updated = { ...profile, avatarUrl }
          setUser(updated)
          void queryClient.setQueryData(['profile'], updated)
          toast.success('Profile picture updated')
        }
      })
      .catch(() => toast.error('Could not upload image'))
      .finally(() => setIsUploading(false))
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (isError || !profile) {
    return <ErrorState title="Could not load your profile" onRetry={() => void refetch()} />
  }

  const displayName = user?.name ?? profile.name

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Identity card */}
      <Card className="relative overflow-hidden">
        <div className="h-24 border-b border-border bg-muted/40" aria-hidden />
        <CardContent className="p-0">
          <div className="relative flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <div className="-mt-10">
              <label
                className="group relative block cursor-pointer"
                aria-label="Upload profile picture"
              >
                <UserAvatar
                  name={displayName}
                  src={profile.avatarUrl}
                  className="h-24 w-24 rounded-xl ring-4 ring-background"
                  fallbackClassName="text-xl rounded-xl"
                />
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  {isUploading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" aria-label="Uploading" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleAvatarUpload(file)
                  }}
                />
              </label>
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h2 className="truncate text-xl font-bold tracking-tight">{displayName}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{profile.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.timezone}
                </span>
                <span className="flex items-center gap-1.5 capitalize">
                  <School className="h-3.5 w-3.5" />
                  {profile.role}
                </span>
                <span className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />
                  Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account information</CardTitle>
          <CardDescription>Update your public profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              updateMutation.mutate()
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Alex" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Rivera" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Mathematics Instructor" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value} className="bg-popover text-popover-foreground">
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell students a little about yourself…"
                rows={4}
                maxLength={280}
              />
              <p className="text-right text-xs text-muted-foreground">{bio.length}/280</p>
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <PreferenceRow
            title="Email notifications"
            description="Get class reminders and summaries by email."
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
          <Separator className="my-2" />
          <PreferenceRow
            title="Push notifications"
            description="Receive real-time alerts in the browser."
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PreferenceRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  )
}