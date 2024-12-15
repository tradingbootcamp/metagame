import { useState, useCallback } from 'react';
import Die from './Die';

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

const getNextValue = (prev?: DieValue): DieValue => {
  const newValue = Math.floor(Math.random() * 6 + 1) as DieValue;
  return newValue === prev ? getNextValue(prev) : newValue;
};

export default function AnimatedDie() {
  const [value, setValue] = useState<DieValue>(3);
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const totalFrames = 5;
    const duration = 500; // 500ms total animation
    const startTime = performance.now();
    let lastFrameIndex = -1;

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      if (elapsed >= duration) {
        setIsAnimating(false);
        return;
      }

      // Calculate which frame we should be on based on progress
      const progress = elapsed / duration;
      const frameIndex = Math.floor(progress * totalFrames);
      
      // Only update value if we've moved to a new frame
      if (frameIndex > lastFrameIndex) {
        setValue(prev => getNextValue(prev));
        lastFrameIndex = frameIndex;
      }

      requestAnimationFrame(animateFrame);
    };

    requestAnimationFrame(animateFrame);
  }, [isAnimating]);

  return (
    <button 
      onClick={animate} 
      disabled={isAnimating}
      className="transition-transform hover:scale-110 active:scale-95"
    >
      <Die value={value} />
    </button>
  );
} 