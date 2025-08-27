'use client'

import { useEffect, useRef, useState } from 'react'

export default function PlayWord({
  children = 'played',
  sound = '/Super Mario Bros.mp3',
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

  return (
    <span
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        color: active ? '#22d3ee' : 'inherit', // cyan-400
        transition: 'color 0.2s',
        fontWeight: 'bold',
      }}
    >
      {children}
    </span>
  )
}
