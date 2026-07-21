'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  borderless?: boolean
  padless?: boolean
  children: React.ReactNode
  tiltFactor?: number
}

// One shared scroll listener writing --angle on :root, ref-counted across
// mounted cards — a per-card listener would repaint every card's PNG-masked
// shine gradient on each scroll frame. Hovered cards shadow this with an
// element-level --angle (removed again on pointer leave).
let scrollAngleUsers = 0
let stopScrollAngle: (() => void) | null = null

function startScrollAngle() {
  const root = document.documentElement
  let lastScrollY = window.scrollY
  let angleDeg = Math.random() * 360
  let ticking = false
  const apply = () => root.style.setProperty('--angle', `${angleDeg}deg`)

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      // Read scrollY inside the frame so fast scrolls between frames
      // accumulate instead of dropping deltas
      const nowY = window.scrollY
      const deltaY = nowY - lastScrollY
      lastScrollY = nowY
      if (deltaY !== 0) {
        angleDeg = (((angleDeg + deltaY * 0.8) % 360) + 360) % 360
        apply()
      }
      ticking = false
    })
  }

  apply()
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    window.removeEventListener('scroll', onScroll)
    root.style.removeProperty('--angle')
  }
}

function acquireScrollAngle() {
  if (scrollAngleUsers++ === 0) stopScrollAngle = startScrollAngle()
  return () => {
    if (--scrollAngleUsers === 0) {
      stopScrollAngle?.()
      stopScrollAngle = null
    }
  }
}

export const Card: React.FC<CardProps> = ({
  className,
  borderless = false,
  padless = false,
  tiltFactor = 1,
  children,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const releaseScrollAngle = acquireScrollAngle()

    const setProp = (prop: string, value: string) =>
      el.style.setProperty(prop, value)

    const onPointerUpdate = (e: PointerEvent) => {
      // Touch has no hover: a tap would set tilt props with no event to ever
      // reset them, leaving the card frozen mid-tilt
      if (e.pointerType !== 'mouse') return
      const rect = el.getBoundingClientRect()
      const width = el.offsetWidth
      const height = el.offsetHeight
      const XRel = e.clientX - rect.left
      const YRel = e.clientY - rect.top

      const normX = (XRel / width - 0.5) * 2 // -1..1 left(-) to right(+)
      const normY = (YRel / height - 0.5) * 2 // -1..1 top(-) to bottom(+)

      const YAngle = -normX * (tiltFactor * 10) // rotateY based on X
      const XAngle = normY * (tiltFactor * 10) // rotateX based on Y

      setProp('--dy', `${YAngle}deg`)
      setProp('--dx', `${XAngle}deg`)
      const angleRad = Math.atan2(normY, normX)
      const angleDeg = ((((angleRad * 180) / Math.PI) % 360) + 360) % 360
      setProp('--angle', `${angleDeg}deg`)
      setProp('--tx', `${normX}`)
      setProp('--ty', `${normY}`)
      const tiltMag = Math.min(1, Math.sqrt(normX * normX + normY * normY))
      setProp('--tilt', `${tiltMag}`)
      setProp('--hover', `1`)
    }

    const resetProps = () => {
      setProp('--dy', '0')
      setProp('--dx', '0')
      setProp('--tx', '0')
      setProp('--ty', '0')
      setProp('--tilt', '0')
      setProp('--hover', '0')
      // Drop the hover-set angle so the card falls back to the shared
      // scroll-driven --angle on :root
      el.style.removeProperty('--angle')
    }

    el.addEventListener('pointermove', onPointerUpdate)
    el.addEventListener('pointerenter', onPointerUpdate)
    el.addEventListener('pointerleave', resetProps)
    el.addEventListener('pointercancel', resetProps)

    return () => {
      el.removeEventListener('pointermove', onPointerUpdate)
      el.removeEventListener('pointerenter', onPointerUpdate)
      el.removeEventListener('pointerleave', resetProps)
      el.removeEventListener('pointercancel', resetProps)
      releaseScrollAngle()
    }
  }, [tiltFactor])

  return (
    <div
      ref={cardRef}
      className={cn(
        'card flex w-fit flex-col rounded-md border-amber-400 text-center transition-all',
        !borderless && 'border-2',
        borderless && 'border-0',
        !padless && 'p-6',
        padless && 'p-0',
        className,
      )}
      style={{
        transform:
          'perspective(3000px) translateZ(0) rotateX(var(--dx, 0)) rotateY(var(--dy, 0))',
        transition: 'all 150ms linear 0s',
      }}
    >
      {children}
    </div>
  )
}
