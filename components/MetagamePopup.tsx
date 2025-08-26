'use client'

import React, { useEffect } from 'react'

interface MetagamePopupProps {
  isOpen: boolean
  onClose: () => void
}

export const MetagamePopup: React.FC<MetagamePopupProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      <div className="relative mx-4 max-w-md rounded-lg border-2 border-amber-400 bg-dark-500 p-8 text-center">
        <button
          className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 font-bold text-dark-500 transition-colors hover:bg-amber-300"
          onClick={onClose}
          aria-label="Close popup"
        >
          ✕
        </button>

        <h3 className="mb-4 text-2xl font-bold text-white">
          What did you think was going to happen?
        </h3>

        <button
          onClick={onClose}
          className="relative rounded-md bg-gradient-to-r from-fuchsia-500 via-amber-500 to-fuchsia-500 p-0.5 font-bold transition-all duration-300 hover:scale-105"
        >
          <div className="h-full w-full rounded-md bg-dark-500 px-6 py-2 text-white uppercase transition-all duration-1000">
            Okay fair
          </div>
        </button>
      </div>
    </div>
  )
}
