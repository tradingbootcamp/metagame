import { useState, useEffect, useRef } from 'react';

interface TagProps {
  text?: string;
  speed?: number;
  catchDistance?: number;
  className?: string;
}

export default function Tag({ 
  text = "tag", 
  speed = 0.05, 
  catchDistance = 50,
  className = ''
}: TagProps) {
  const [isChasing, setIsChasing] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const tagRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isChasing || !tagRef.current) return;

    const animate = () => {
      setTextPosition(prevPosition => {
        const dx = mousePosition.x - prevPosition.x;
        const dy = mousePosition.y - prevPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if caught
        if (distance < catchDistance && !isCaught) {
          setIsCaught(true);
          setIsChasing(false);
          return prevPosition;
        }

        return {
          x: prevPosition.x + dx * speed,
          y: prevPosition.y + dy * speed
        };
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isChasing, mousePosition, speed, catchDistance, isCaught]);

  // Start chasing after hover
  const handleMouseEnter = () => {
    if (!isChasing && !isCaught) {
      const rect = tagRef.current?.getBoundingClientRect();
      if (rect) {
        setTextPosition({ x: rect.left, y: rect.top });
      }
      setTimeout(() => setIsChasing(true), 500);
    }
  };

  return (
    <div
      ref={tagRef}
      className={`
        group 
        inline-block 
        relative 
        cursor-pointer 
        select-none 
        ${className}
      `}
      style={{
        position: isChasing ? 'fixed' : 'relative',
        left: isChasing ? `${textPosition.x}px` : 'auto',
        top: isChasing ? `${textPosition.y}px` : 'auto',
        transition: isChasing ? 'none' : 'color 0.3s ease',
        color: isCaught ? 'red' : (isChasing ? 'blue' : 'inherit'),
        zIndex: 1000,
      }}
      onMouseEnter={handleMouseEnter}
    >
      {isCaught ? 'IT' : text}
    </div>
  );
} 