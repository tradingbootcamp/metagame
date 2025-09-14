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
      id="holo"
      className={`${cn('z-4', styles.shine, styles[effect], 'absolute inset-0 z-3 size-full opacity-[.3] transition-opacity duration-300 hover:opacity-100', className)}`}
    />
  )
}
