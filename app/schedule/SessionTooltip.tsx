import { useRef, useState } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const SessionTooltip = ({
  children,
  tooltip,
  tooltipMaxWidth = 480,
  margin = 20,
}: {
  children: React.ReactNode
  tooltip: React.ReactNode
  tooltipMaxWidth?: number
  margin?: number
}) => {
  // Keep this tooltip purely hover-based and not hoverable itself.
  // disableHoverableContent ensures it closes immediately when leaving the trigger.
  // Choose left/right based on available space and clamp width to prevent overlap.
  const [side, setSide] = useState<'right' | 'left'>('right')
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined)
  const triggerRef = useRef<HTMLDivElement>(null)
  const handleMouseEnter = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const spaceLeft = rect.left - margin
    const spaceRight = viewportWidth - rect.right - margin

    // Pick a side that can fit the preferred width; otherwise pick the roomier side
    if (spaceRight >= tooltipMaxWidth) {
      setSide('right')
      setMaxWidth(Math.min(tooltipMaxWidth, spaceRight))
    } else if (spaceLeft >= tooltipMaxWidth) {
      setSide('left')
      setMaxWidth(Math.min(tooltipMaxWidth, spaceLeft))
    } else if (spaceRight >= spaceLeft) {
      setSide('right')
      setMaxWidth(Math.max(0, spaceRight))
    } else {
      setSide('left')
      setMaxWidth(Math.max(0, spaceLeft))
    }
  }
  return (
    <Tooltip disableHoverableContent showArrow={false}>
      <TooltipTrigger asChild>
        <div ref={triggerRef} onMouseEnter={handleMouseEnter}>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align="start"
        avoidCollisions
        collisionPadding={margin}
        sideOffset={margin}
        className="z-[100] border-none bg-transparent p-0 text-left shadow-none pointer-events-none"
        style={{ maxWidth: maxWidth ? `${maxWidth}px` : undefined }}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
