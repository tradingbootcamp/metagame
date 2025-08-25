'use client'

import { useRef, useState } from 'react'

import SessionDetailsCard from './SessionModalCard'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { DbSessionView } from '@/types/database/dbTypeAliases'

interface SmartSessionTooltipProps {
  session: DbSessionView
  children: React.ReactNode
}

export function SmartSessionTooltip({
  session,
  children,
}: SmartSessionTooltipProps) {
  const [tooltipSide, setTooltipSide] = useState<
    'top' | 'bottom' | 'left' | 'right'
  >('top')
  const [tooltipAlign, setTooltipAlign] = useState<'start' | 'center' | 'end'>(
    'center',
  )
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!triggerRef.current) return

    const mouseX = e.clientX
    const mouseY = e.clientY
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // Calculate available space in each direction
    const spaceAbove = mouseY
    const spaceBelow = windowHeight - mouseY
    const spaceLeft = mouseX
    const spaceRight = windowWidth - mouseX

    // Determine the best side to show the tooltip
    let side: 'top' | 'bottom' | 'left' | 'right' = 'top'
    let align: 'start' | 'center' | 'end' = 'center'

    // Check if we're near the edges
    const isNearLeft = mouseX < 300
    const isNearRight = mouseX > windowWidth - 300
    const isNearTop = mouseY < 200
    const isNearBottom = mouseY > windowHeight - 200

    if (isNearRight && spaceLeft > spaceRight) {
      side = 'left'
      align =
        mouseY < windowHeight / 2
          ? 'start'
          : mouseY > windowHeight * 0.8
            ? 'end'
            : 'center'
    } else if (isNearLeft && spaceRight > spaceLeft) {
      side = 'right'
      align =
        mouseY < windowHeight / 2
          ? 'start'
          : mouseY > windowHeight * 0.8
            ? 'end'
            : 'center'
    } else if (isNearBottom && spaceAbove > spaceBelow) {
      side = 'top'
      align =
        mouseX < windowWidth / 2
          ? 'start'
          : mouseX > windowWidth * 0.8
            ? 'end'
            : 'center'
    } else if (isNearTop && spaceBelow > spaceAbove) {
      side = 'bottom'
      align =
        mouseX < windowWidth / 2
          ? 'start'
          : mouseX > windowWidth * 0.8
            ? 'end'
            : 'center'
    } else {
      side = 'bottom'
      align =
        mouseX < windowWidth / 2
          ? 'start'
          : mouseX > windowWidth * 0.8
            ? 'end'
            : 'center'
    }

    setTooltipSide(side)
    setTooltipAlign(align)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={triggerRef} onMouseEnter={handleMouseEnter}>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side={tooltipSide}
        align={tooltipAlign}
        className="border-none bg-transparent p-0 shadow-none"
        sideOffset={8}
      >
        <SessionDetailsCard session={session} />
      </TooltipContent>
    </Tooltip>
  )
}
