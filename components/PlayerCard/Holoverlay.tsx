'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

import styles from '@/components/PlayerCard/holo.module.css'

export type HoloEffect = 'dice' | 'lines' | 'wavy'
export default function Holoverlay({
  effect,
  className,
  scrollControlsAngle = true,
}: {
  effect: HoloEffect
  className?: string
  scrollControlsAngle?: boolean
}) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = overlayRef.current
    if (!el || !scrollControlsAngle) return

    let ticking = false
    const setAngle = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0
      const angle = (scrollY * 0.8) % 360
      el.style.setProperty('--angle', `${angle}deg`)
      el.style.setProperty('--mouseAngle', `${angle}deg`)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setAngle()
        ticking = false
      })
    }

    const onResize = onScroll

    setAngle()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [scrollControlsAngle])

  return (
    <div
      ref={overlayRef}
      id="holo"
      className={cn(
        'pointer-events-none absolute inset-0 z-4 size-full opacity-[.3] transition-opacity duration-300 hover:opacity-100',
        styles.shine,
        styles[effect],
        className,
      )}
    />
  )
}
