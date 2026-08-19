import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, initials } from '@/lib/utils'

const AVATAR_TONES = [
  'bg-blue-600/80 text-blue-50',
  'bg-violet-600/70 text-violet-50',
  'bg-cyan-700/80 text-cyan-50',
  'bg-emerald-700/80 text-emerald-50',
  'bg-amber-600/80 text-amber-50',
  'bg-rose-700/80 text-rose-50',
  'bg-indigo-600/80 text-indigo-50',
  'bg-teal-700/80 text-teal-50',
]

function toneFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length] ?? AVATAR_TONES[0]!
}

export interface UserAvatarProps {
  name: string
  src?: string
  className?: string
  fallbackClassName?: string
  alt?: string
  loading?: boolean
}

export function UserAvatar({
  name,
  src,
  className,
  fallbackClassName,
  alt,
  loading = false,
}: UserAvatarProps) {
  return (
    <Avatar className={cn('h-9 w-9', className)}>
      {src && <AvatarImage src={src} alt={alt ?? name} />}
      <AvatarFallback
        className={cn(
          'text-primary-foreground text-xs font-medium',
          toneFor(name),
          loading && 'animate-pulse',
          fallbackClassName,
        )}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}