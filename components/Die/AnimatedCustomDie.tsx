import { useEffect, useRef, useState } from 'react'

import { CustomDie } from './CustomDie'
import {
  type DieGenerationOptions,
  type Face,
  generateRandomDieIdentifier,
} from './DiceUtils'

import { cn } from '@/utils/cn'
import { enforceFavicon } from '@/utils/favicon'

type AnimatedCustomDieProps = {
  startingDieIdentifier?: Record<Face, number> //default starting die if you dont want a random one on load
  dieGenerationOptions?: DieGenerationOptions // options for generating the die; whether to allow repeats, 7 sum, zero/blank
  duration?: number // duration of the animation
  totalFrames?: number // number of frames (different dice)
  className?: string // class to apply to the die button
  scaleAnimation?: boolean // scale the die when animating
}

export default function AnimatedCustomDie({
  startingDieIdentifier,
  dieGenerationOptions = {},
  duration = 500,
  totalFrames = 8,
  scaleAnimation = true,
  className = '',
}: AnimatedCustomDieProps) {
  const [dieIdentifier, setDieIdentifier] = useState(
    startingDieIdentifier ?? generateRandomDieIdentifier(dieGenerationOptions),
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const svgToDataUrl = (svg: SVGSVGElement) => {
    const clone = svg.cloneNode(true) as SVGSVGElement
    // Normalize favicon-friendly size
    clone.setAttribute('width', '64')
    clone.setAttribute('height', '64')
    const svgString = clone.outerHTML
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`
  }

  const animate = () => {
    if (isAnimating) return

    setIsAnimating(true)
    const startTime = performance.now()
    let lastFrameIndex = -1

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime
      if (elapsed >= duration) {
        setIsAnimating(false)
        return
      }

      // Calculate which frame we should be on based on progress
      const progress = elapsed / duration
      const frameIndex = Math.floor(progress * totalFrames)

      // Only update value if we've moved to a new frame
      if (frameIndex > lastFrameIndex) {
        setDieIdentifier((prev) => {
          const next = generateRandomDieIdentifier(dieGenerationOptions)
          // Ensure we don't get the same values
          return next.left === prev.left &&
            next.top === prev.top &&
            next.right === prev.right
            ? generateRandomDieIdentifier(dieGenerationOptions)
            : next
        })
        lastFrameIndex = frameIndex
      }

      requestAnimationFrame(animateFrame)
    }

    requestAnimationFrame(animateFrame)
  }

  // On mount, set favicon to the starting/custom die
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    enforceFavicon(svgToDataUrl(el))
     
  }, [])

  // When animation completes, set favicon to the final custom die
  useEffect(() => {
    if (isAnimating) return
    const el = svgRef.current
    if (!el) return
    enforceFavicon(svgToDataUrl(el))
  }, [isAnimating, dieIdentifier])

  return (
    <button
      onClick={animate}
      disabled={isAnimating}
      className={cn(
        'relative inline-flex size-10 items-center justify-center transition-transform duration-500',
        className,
      )}
      style={
        scaleAnimation
          ? {
              transform: isAnimating ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.1s ease-in-out',
            }
          : {}
      }
    >
      <CustomDie ref={svgRef} dieIdentifier={dieIdentifier} size={40} />
    </button>
  )
}
