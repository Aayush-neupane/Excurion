import type { ConnectionQuality } from '@/types/user'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const QUALITY_META: Record<ConnectionQuality, { label: string; dot: string; tone: 'success' | 'warning' | 'destructive' | 'outline' }> = {
  excellent: { label: 'Excellent', dot: 'bg-success', tone: 'success' },
  good: { label: 'Good', dot: 'bg-success/70', tone: 'success' },
  fair: { label: 'Fair', dot: 'bg-warning', tone: 'warning' },
  poor: { label: 'Poor', dot: 'bg-destructive', tone: 'destructive' },
}

export function ConnectionBadge({
  quality,
  className,
  compact = false,
}: {
  quality: ConnectionQuality
  className?: string
  compact?: boolean
}) {
  const meta = QUALITY_META[quality]
  return (
    <Badge
      variant={meta.tone}
      className={cn('gap-1.5 px-2 py-0.5', compact && 'text-[10px]', className)}
      title={`Connection quality: ${meta.label.toLowerCase()}`}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden />
      {!compact && meta.label}
    </Badge>
  )
}