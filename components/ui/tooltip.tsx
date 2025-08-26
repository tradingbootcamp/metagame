'use client'

import * as React from 'react'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

const TooltipContext = React.createContext<{
  clickable: boolean
  showArrow?: boolean
  open?: boolean
  setOpen?: (open: boolean) => void
  hoverTimeoutRef?: React.RefObject<NodeJS.Timeout | null>
  triggerRef?: React.RefObject<HTMLButtonElement | null>
  contentRef?: React.RefObject<HTMLDivElement | null>
  isScrolling?: boolean
}>({ clickable: false })

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

interface TooltipProps
  extends React.ComponentProps<typeof TooltipPrimitive.Root> {
  clickable?: boolean
  showArrow?: boolean
}

function Tooltip({
  clickable = false,
  showArrow = true,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [wasOpenBeforeScroll, setWasOpenBeforeScroll] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  // Handle scroll behavior for clickable tooltips
  useEffect(() => {
    if (!clickable) return

    const handleScroll = () => {
      // Remember if tooltip was open before scroll
      if (open && !isScrolling) {
        setWasOpenBeforeScroll(true)
      }

      setIsScrolling(true)
      setOpen(false) // Always hide immediately when scrolling

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)

        // Reopen if it was open before scroll and mouse is still over trigger
        if (wasOpenBeforeScroll && triggerRef.current?.matches(':hover')) {
          setOpen(true)
        }
        setWasOpenBeforeScroll(false)
      }, 250) // 0.25s after scroll stops
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [clickable, open, isScrolling, wasOpenBeforeScroll])

  const contextValue = useMemo(
    () => ({
      clickable,
      open,
      setOpen,
      hoverTimeoutRef,
      triggerRef,
      contentRef,
      isScrolling,
      showArrow,
    }),
    [clickable, open, isScrolling, showArrow],
  )

  if (clickable) {
    return (
      <TooltipContext.Provider value={contextValue}>
        <TooltipProvider>
          <TooltipPrimitive.Root
            data-slot="tooltip"
            open={open}
            onOpenChange={setOpen}
            {...props}
          />
        </TooltipProvider>
      </TooltipContext.Provider>
    )
  }

  return (
    <TooltipContext.Provider value={contextValue}>
      <TooltipProvider>
        <TooltipPrimitive.Root data-slot="tooltip" {...props} />
      </TooltipProvider>
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const { clickable, open, setOpen, hoverTimeoutRef, triggerRef, isScrolling } =
    useContext(TooltipContext)

  if (clickable && setOpen && hoverTimeoutRef) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (onClick) onClick(e)
      // Clear any pending close timeout when clicking
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      setOpen(!open)
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onMouseEnter) onMouseEnter(e)
      // Don't open during scroll - let the scroll handler deal with it
      if (isScrolling) return

      // Clear any pending close timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
      setOpen(true)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onMouseLeave) onMouseLeave(e)

      // Set a timeout to close, which can be cancelled if mouse enters content
      hoverTimeoutRef.current = setTimeout(() => {
        setOpen(false)
        hoverTimeoutRef.current = null
      }, 300) // Allow time to move to content
    }

    return (
      <TooltipPrimitive.Trigger
        data-slot="tooltip-trigger"
        type="button"
        ref={triggerRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }

  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const { clickable, setOpen, hoverTimeoutRef, contentRef, showArrow } =
    useContext(TooltipContext)

  if (clickable && setOpen && hoverTimeoutRef) {
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onMouseEnter) onMouseEnter(e)
      // Cancel any pending close timeout when hovering over content
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onMouseLeave) onMouseLeave(e)

      // Set timeout to close when leaving content
      hoverTimeoutRef.current = setTimeout(() => {
        setOpen(false)
        hoverTimeoutRef.current = null
      }, 300) // Match the trigger timeout
    }

    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          data-slot="tooltip-content"
          sideOffset={sideOffset}
          ref={contentRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'z-50 w-fit max-w-[calc(100vw-2rem)] origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-bg-tertiary px-3 py-1.5 text-center text-xs text-balance text-primary fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 sm:max-w-80',
            className,
          )}
          {...props}
        >
          {children}
          {showArrow && (
            <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-bg-tertiary fill-bg-tertiary" />
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    )
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-fit max-w-[calc(100vw-2rem)] origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-bg-tertiary px-3 py-1.5 text-center text-xs text-balance text-primary fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 sm:max-w-80',
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-bg-tertiary fill-bg-tertiary" />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
