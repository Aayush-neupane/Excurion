import brandMark from '@/assets/excurion.png'
import { cn } from '@/lib/utils'

const CROSS_STROKES =
  'M 14.31 -9.89 L -3.15 4.77 L 43.13 59.67 L 60.59 45.07 Z ' +
  'M -3.15 105.89 L 14.31 91.23 L 60.59 34.27 L 43.13 48.93 Z ' +
  'M 65.73 44.61 L 48.27 29.95 L 81.69 -9.89 L 99.15 4.77 Z ' +
  'M 48.27 66.05 L 65.73 51.40 L 99.15 91.23 L 81.69 105.89 Z'

interface LogoProps {
  className?: string
  markClassName?: string
  textClassName?: string
  stacked?: boolean
}

export function Logo({ className, markClassName, textClassName, stacked = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', stacked && 'flex-col gap-2', className)}>
      <img
        src={brandMark}
        alt=""
        aria-hidden
        className={cn('h-9 w-9 object-contain', markClassName)}
        draggable={false}
      />
      <span
        className={cn(
          'flex items-baseline text-2xl font-extrabold leading-none tracking-[0.08em]',
          textClassName,
        )}
      >
        E
        <svg
          viewBox="-3.5 -10 103 116"
          aria-hidden
          focusable="false"
          className="h-[0.73em] w-[0.65em] shrink-0"
        >
          <path d={CROSS_STROKES} fill="currentColor" />
        </svg>
        CURION
      </span>
    </div>
  )
}