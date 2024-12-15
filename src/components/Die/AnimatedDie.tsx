import { useState, useEffect } from 'react';
import Die from './Die';

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

const getNextValue = (prev?: DieValue): DieValue => {
  const newValue = Math.floor(Math.random() * 6 + 1) as DieValue;
  return newValue === prev ? getNextValue(prev) : newValue;
};

export default function AnimatedDie() {
  const [value, setValue] = useState<DieValue>(3);
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = () => {
    setIsAnimating(true);
    let count = 0;
    const interval = setInterval(() => {
      setValue(prev => getNextValue(prev));
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 70);
  };

  return (
    <button 
      onClick={animate} 
      disabled={isAnimating}
      className=""
    >
      <Die value={getNextValue()} />
    </button>
  );
} 