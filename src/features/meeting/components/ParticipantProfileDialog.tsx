import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Briefcase, Clock, Mail, GraduationCap, Radio } from 'lucide-react'
import { meetingApi, profileApi } from '@/api'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export function ParticipantProfileDialog({
  userId,
  onClose,
}: {
  userId: string | null
  onClose: () => void
}) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileApi.getProfileById(userId!),
    enabled: !!userId,
  })

  const { data: liveRooms } = useQuery({
    queryKey: ['live-rooms-by-host', userId],
    queryFn: () => meetingApi.getLiveRoomsByHost(userId!),
    enabled: !!userId,
  })

  return (
    <Dialog open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm" aria-describedby="participant-profile-desc">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription id="participant-profile-desc">
            Public details shared by this member.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !profile ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={profile.name}
                src={profile.avatarUrl}
                className="h-14 w-14 rounded-xl"
                fallbackClassName="text-lg rounded-xl"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold leading-tight">{profile.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge variant={profile.role === 'teacher' ? 'default' : 'secondary'} className="capitalize">
                    {profile.role === 'teacher' ? (
                      <GraduationCap className="h-3 w-3" aria-hidden />
                    ) : null}
                    {profile.role}
                  </Badge>
                  {profile.title && (
                    <span className="truncate text-xs text-muted-foreground">{profile.title}</span>
                  )}
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-sm leading-relaxed text-foreground/90">{profile.bio}</p>
              </div>
            )}

            {!!liveRooms?.length && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Ongoing classes
                </p>
                {liveRooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/meeting/${room.id}`}
                    className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2 transition-colors hover:bg-accent"
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                    </span>
                    <Radio className="h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{room.title}</span>
                    {room.participants > 0 && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {room.participants} in room
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            <div className="grid gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{profile.email}</span>
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {profile.timezone}
              </span>
              {profile.company && (
                <span className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {profile.company}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground/70">
                Member since{' '}
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
