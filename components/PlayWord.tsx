'use client'

import { useRef, useState } from 'react'

export default function PlayWord({
  children = 'played',
  sound = '/Super Mario Bros.mp3',
  hoverColor = '#67e8f9',
  differentColor = '#e0f7fa',
}) {
  const [active, setActive] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const loadAudio = () => {
    if (!audioRef.current && !audioLoaded) {
      audioRef.current = new Audio(sound)
      audioRef.current.preload = 'auto'
      setAudioLoaded(true)
    }
  }

  const handleClick = () => {
    loadAudio()
    if (!audioRef.current) return
    setActive(true)
    audioRef.current.currentTime = 0
    audioRef.current.play()
    audioRef.current.onended = () => {
      setActive(false)
    }
  }

  const handleMouseEnter = () => {
    setHovered(true)
    loadAudio()
  }

  const [hovered, setHovered] = useState(false)

  let color = differentColor
  if (active) {
    color = '#22d3ee'
  } else if (hovered) {
    color = hoverColor
  }

  return (
    <span
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
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
