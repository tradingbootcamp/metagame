import { cn } from '@/lib/utils'

import styles from '@/components/PlayerCard/holo.module.css'

export type HoloEffect = 'dice' | 'lines' | 'wavy'

export default function Holoverlay({
  effect,
  className,
}: {
  effect: HoloEffect
  className?: string
}) {
  return (
    <div
      className={cn(
        // z-6 sits above the card content (z-4/z-5 layers) so the shine covers
        // the whole card; pointer-events-none keeps everything under it (the
        // navigation link, the footer site link) clickable
        'pointer-events-none absolute inset-0 z-6 size-full opacity-[.3] transition-opacity duration-300 group-hover:opacity-100',
        styles.shine,
        styles[effect],
        className,
      )}
    />
  )
}
