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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  const tagRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(null)
  const styleIdRef = useRef<string>(
    `tag-cursor-${Math.random().toString(36).substr(2, 9)}`,
  )
  const updateCursorRef = useRef<((e: MouseEvent) => void) | null>(null)

  // Add a reset function
  const resetCursor = () => {
    // Remove the style tag by ID
    const existingStyle = document.getElementById(styleIdRef.current)
    if (existingStyle) {
      existingStyle.remove()
    }

    // Remove the mousemove listener
    if (updateCursorRef.current) {
      window.removeEventListener('mousemove', updateCursorRef.current)
      updateCursorRef.current = null
    }

    // Reset cursor
    document.body.style.cursor = 'default'

    setIsCaught(false)
    setHasEntered(false)
    setIsChasing(false)
  }
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animation loop
  useEffect(() => {
    if (!isChasing || !tagRef.current) return

    const animate = () => {
      setTextPosition((prevPosition) => {
        const dx = mousePosition.x - prevPosition.x
        const dy = mousePosition.y - prevPosition.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Check if caught
        if (isChasing && distance < catchDistance) {
          setIsCaught(true)
          setIsChasing(false)
          const cursorStyle = `
            * {
              cursor: none !important;
            }
            body::after {
              content: 'IT';
              font-size: 30px;
              font-weight: bold;
              color: gold;
              position: fixed;
              left: 0;
              top: 0;
              pointer-events: none;
              z-index: 9999;
              transform: translate(calc(var(--x, 0) * 1px - 50%), calc(var(--y, 0) * 1px - 50%));
            }
          `
          const styleSheet = document.createElement('style')
          styleSheet.id = styleIdRef.current
          styleSheet.textContent = cursorStyle
          document.head.appendChild(styleSheet)

          // Set initial position immediately using current mousePosition
          document.body.style.setProperty('--x', mousePosition.x.toString())
          document.body.style.setProperty('--y', mousePosition.y.toString())

          // Add mousemove handler to update emoji position
          const updateCursor = (e: MouseEvent) => {
            document.body.style.setProperty('--x', e.clientX.toString())
            document.body.style.setProperty('--y', e.clientY.toString())
          }
          window.addEventListener('mousemove', updateCursor)

          // Store the event listener reference for cleanup
          updateCursorRef.current = updateCursor

          setTimeout(() => {
            resetCursor()
          }, IT_DURATION)
          return prevPosition
        }

        return {
          x: prevPosition.x + dx * speed * 3,
          y: prevPosition.y + dy * speed * 3,
        }
      })
      if (isCaught) return
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [isChasing, mousePosition, speed, catchDistance, isCaught])

  const debouncedSetIsChasing = useDebounce(() => setIsChasing(true), 1000, {
    leading: false,
  })

  // Track whether we've touched the inner span where the text is
  const handleTextMouseover = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHasEntered(true)
  }

  // Start chasing after leaving outer boundary area
  const handlePaddedMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation()
    //if the mouse hasnt entered the trigger area, dont chase
    if (!hasEntered || isCaught) return
    if (!isChasing) {
      const rect = tagRef.current?.getBoundingClientRect()
      if (rect) {
        setTextPosition({ x: rect.left, y: rect.top })
      }
      debouncedSetIsChasing()
    }
  }

  const handlePaddedMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation()
    debouncedSetIsChasing.cancel()
  }

  // Add cleanup effect
  useEffect(() => {
    return () => {
      resetCursor()
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
    </span>
  )
}
