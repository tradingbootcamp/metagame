'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/utils/cn'

interface CardProps {
  className?: string
  borderless?: boolean
  padless?: boolean
  children: React.ReactNode
  tiltFactor?: number
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

    const setProp = (prop: string, value: string) =>
      el.style.setProperty(prop, value)

    const onMouseUpdate = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const width = el.offsetWidth
      const XRel = e.clientX - rect.left
      const YRel = e.clientY - rect.top

      const YAngle = (0.5 - XRel / width) * (tiltFactor * 10)
      const XAngle = -(0.5 - YRel / width) * (tiltFactor * 10)

      setProp('--dy', `${YAngle}deg`)
      setProp('--dx', `${XAngle}deg`)
    }

    const resetProps = () => {
      setProp('--dy', '0')
      setProp('--dx', '0')
    }

    el.addEventListener('mousemove', onMouseUpdate)
    el.addEventListener('mouseenter', onMouseUpdate)
    el.addEventListener('mouseleave', resetProps)

    return () => {
      el.removeEventListener('mousemove', onMouseUpdate)
      el.removeEventListener('mouseenter', onMouseUpdate)
      el.removeEventListener('mouseleave', resetProps)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={cn(
        'card flex flex-col rounded-md border-amber-400 text-center transition-all',
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
