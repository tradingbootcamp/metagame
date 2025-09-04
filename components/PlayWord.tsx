'use client'

import { useEffect, useRef, useState } from 'react'

export default function PlayWord({
  children = 'played',
  sound = '/Super Mario Bros.mp3',
  hoverColor = '#67e8f9',
}) {
  const [active, setActive] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio(sound)
    audioRef.current.preload = 'auto'
    return () => {
      if (audioRef.current) audioRef.current.remove()
    }
  }, [sound])

  const handleClick = () => {
    if (!audioRef.current) return
    setActive(true)
    audioRef.current.currentTime = 0
    audioRef.current.play()
    audioRef.current.onended = () => {
      setActive(false)
    }
  }

  const [hovered, setHovered] = useState(false)

  let color = 'inherit'
  if (active) {
    color = '#22d3ee' // cyan-400
  } else if (hovered) {
    color = hoverColor // cyan-300 (lighter)
  }

  return (
    <span
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        color,
        transition: 'color 0.2s',
        fontWeight: 'bold',
      }}
    >
      {children}
    </span>
  )
}
