import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  textClassName?: string
}

export function Logo({ className, textClassName }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('text-base font-semibold tracking-tight', textClassName)}>
        Excurion
      </span>
    </div>
  )
}