import React from 'react'

interface ButtonProps {
  link?: string
  target?: string
  children: React.ReactNode
  className?: string
  background?: string
}

export const Button: React.FC<ButtonProps> = ({
  link,
  target,
  children,
  className = '',
  background,
}) => {
  const bg =
    background ??
    'bg-gradient-to-r from-fuchsia-500 via-amber-500 to-fuchsia-500'

  return (
    <a
      href={link}
      target={target}
      className={`btn-container relative inline-block transition-all hover:scale-105 ${className}`}
    >
      <div
        className={`btn-blur ${bg} absolute top-0 right-0 bottom-0 left-0 -z-10 rounded-md`}
      ></div>
      <div
        className={`tickets-btn ${bg} relative rounded-md p-0.5 font-bold transition-all duration-300`}
      >
        <div className="content h-full w-full rounded-md bg-bg-primary px-12 py-3 uppercase transition-all duration-1000">
          {children}
        </div>
      </div>
    </a>
  )
}
