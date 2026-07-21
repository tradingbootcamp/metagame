import { useEffect, useRef, useState } from 'react'

import { useDebounce } from '@/utils/useDebounce'

interface TagProps {
  text?: string
  speed?: number
  catchDistance?: number
  outsetDistance?: number
  className?: string
}

const IT_DURATION = 5000

export default function Tag({
  text = 'tag',
  speed = 0.05,
  catchDistance = 50,
  outsetDistance = 50,
  className = '',
}: TagProps) {
  const [isChasing, setIsChasing] = useState(false)
  const [isCaught, setIsCaught] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })

  const tagRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const overlayMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null)
  // Kept in sync synchronously (not via an effect) so handleCaught's re-entry
  // guard holds even when it's hit twice before a re-render
  const isCaughtRef = useRef(false)
  const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track mouse position without causing re-renders
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const resetCursor = () => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
    if (overlayMoveHandlerRef.current) {
      window.removeEventListener('mousemove', overlayMoveHandlerRef.current)
      overlayMoveHandlerRef.current = null
    }
    document.body.style.cursor = 'default'
    isCaughtRef.current = false
    setIsCaught(false)
    setHasEntered(false)
    setIsChasing(false)
  }

  const handleCaught = () => {
    if (isCaughtRef.current) return
    isCaughtRef.current = true
    setIsCaught(true)
    setIsChasing(false)

    // Hide the system cursor
    document.body.style.cursor = 'none'

    // Position the overlay initially
    const { x, y } = mouseRef.current
    const overlay = overlayRef.current
    if (overlay) {
      overlay.style.left = `${x}px`
      overlay.style.top = `${y}px`
    }

    // Follow cursor without re-renders
    const updateOverlayPosition = (e: MouseEvent) => {
      if (!overlayRef.current) return
      overlayRef.current.style.left = `${e.clientX}px`
      overlayRef.current.style.top = `${e.clientY}px`
    }
    window.addEventListener('mousemove', updateOverlayPosition)
    overlayMoveHandlerRef.current = updateOverlayPosition

    resetTimeoutRef.current = setTimeout(() => {
      resetCursor()
    }, IT_DURATION)
  }

  useEffect(() => {
    if (!isChasing || !tagRef.current) return

    const animate = () => {
      const { x: mx, y: my } = mouseRef.current
      // Catch detection happens out here, not inside the setState updater —
      // updaters must be pure (StrictMode double-invokes them, which used to
      // leak a second mousemove listener and an uncancelled timeout per catch)
      const prev = positionRef.current
      const dx = mx - prev.x
      const dy = my - prev.y
      const distance = Math.hypot(dx, dy)

      if (distance < catchDistance) {
        handleCaught()
        return
      }
      const next = { x: prev.x + dx * speed * 3, y: prev.y + dy * speed * 3 }
      positionRef.current = next
      setTextPosition(next)
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [isChasing, speed, catchDistance])

  const debouncedSetIsChasing = useDebounce(() => setIsChasing(true), 1000, {
    leading: false,
  })

  const handleTextMouseover = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHasEntered(true)
  }

  const handlePaddedMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasEntered || isCaught) return
    if (!isChasing) {
      const rect = tagRef.current?.getBoundingClientRect()
      if (rect) {
        positionRef.current = { x: rect.left, y: rect.top }
        setTextPosition({ x: rect.left, y: rect.top })
      }
      debouncedSetIsChasing()
    }
  }

  const handlePaddedMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation()
    debouncedSetIsChasing.cancel()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetCursor()
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <span className="relative">
      <div
        className="absolute cursor-default"
        onMouseLeave={handlePaddedMouseLeave}
        onMouseEnter={handlePaddedMouseEnter}
        style={{
          top: `-${outsetDistance}px`,
          left: `-${outsetDistance}px`,
          right: `-${outsetDistance}px`,
          bottom: `-${outsetDistance}px`,
        }}
      />
      {/* When chasing, render an invisible placeholder for spacing */}
      <span className={`${isChasing ? 'opacity-0' : 'hidden'}`}>{text}</span>
      <span
        ref={tagRef}
        onMouseEnter={handleTextMouseover}
        className={`group relative inline-block cursor-pointer select-none ${className} `}
        style={{
          position: isChasing ? 'fixed' : 'relative',
          left: isChasing ? `${textPosition.x}px` : 'auto',
          top: isChasing ? `${textPosition.y}px` : 'auto',
          transition: isChasing ? 'none' : 'color 0.3s ease',
          color: isChasing || isCaught ? 'gold' : 'inherit',
          zIndex: 1000,
        }}
      >
        {text}
      </span>
      {isCaught && (
        <div
          ref={overlayRef}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            fontSize: 30,
            fontWeight: 'bold',
            color: 'gold',
          }}
        >
          IT
        </div>
      )}
    </span>
  )
}
