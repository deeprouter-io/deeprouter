/*
Copyright (C) 2026 DeepRouter
SPDX-License-Identifier: AGPL-3.0-or-later
*/
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface MetricCardProps {
  title: string
  value: string | null
  description: string
  icon: LucideIcon
  loading?: boolean
  trackingFailed?: boolean
  accentIndex?: number
  className?: string
}

const SPARKLINE_HEIGHTS = [34, 52, 44, 68, 58, 76, 48, 62, 86, 72, 56, 78]
const ACCENT_CLASSES = [
  'from-chart-1/80 via-chart-1/35',
  'from-chart-2/80 via-chart-2/35',
  'from-chart-3/80 via-chart-3/35',
  'from-chart-4/80 via-chart-4/35',
  'from-chart-5/80 via-chart-5/35',
]

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  trackingFailed,
  accentIndex = 0,
  className,
}: MetricCardProps) {
  const { t } = useTranslation()
  const accentClass = ACCENT_CLASSES[accentIndex % ACCENT_CLASSES.length]

  const displayValue = trackingFailed || value === null ? '—' : value

  const displayDesc = trackingFailed
    ? t('Tracking unavailable')
    : value === null
      ? t('No data in this period')
      : description

  return (
    <div
      className={cn(
        'bg-background/60 flex min-h-32 flex-col justify-between gap-3 overflow-hidden rounded-xl border p-3',
        className
      )}
    >
      <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
        <Icon
          className='text-muted-foreground/60 size-3.5 shrink-0'
          aria-hidden='true'
        />
        <span className='line-clamp-2 leading-snug'>{title}</span>
      </div>

      {loading ? (
        <div className='flex flex-col gap-1.5'>
          <Skeleton className='h-7 w-24' />
          <Skeleton className='h-3.5 w-32' />
        </div>
      ) : (
        <div className='flex flex-col gap-1'>
          <div
            className={cn(
              'font-mono text-2xl font-semibold tracking-tight break-all tabular-nums',
              displayValue === '—'
                ? 'text-muted-foreground/40'
                : 'text-foreground'
            )}
          >
            {displayValue}
          </div>
          <p className='text-muted-foreground/60 text-xs leading-relaxed'>
            {displayDesc}
          </p>
        </div>
      )}

      <div
        className='flex h-8 items-end gap-1'
        aria-hidden='true'
        data-testid='metric-card-visual'
      >
        {SPARKLINE_HEIGHTS.map((height, i) => (
          <span
            key={i}
            className={cn(
              'flex-1 rounded-t-sm bg-linear-to-t to-transparent',
              trackingFailed || value === null
                ? 'from-muted-foreground/20 via-muted-foreground/10 opacity-25'
                : accentClass
            )}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}
