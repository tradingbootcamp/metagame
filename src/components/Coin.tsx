import { useState, useEffect, useRef } from 'react';

interface Props {
  text: string;
  className?: string;
}

export default function Coin({ text, className = '' }: Props) {
  const [isCoinCollected, setIsCoinCollected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    // Initialize audio only on client side
    const audio = new Audio('/sounds_coin.wav');
    audio.preload = 'auto';
    audio.addEventListener('error', (e) => {
      console.error('Error loading audio:', e);
    });
    audioRef.current = audio;

    // Enable audio on any document interaction
    const enableAudio = () => {
      setIsAudioEnabled(true);
      document.removeEventListener('click', enableAudio);
    };
    document.addEventListener('click', enableAudio);

    return () => {
      if (audioRef.current) {
        audioRef.current.remove();
      }
      document.removeEventListener('click', enableAudio);
    };
  }, []);

  const handleMouseEnter = async () => {
    if (!isCoinCollected && audioRef.current && isAudioEnabled) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsCoinCollected(true);
      } catch (err) {
        console.error('Error playing audio:', err);
      }
    } else if (!isCoinCollected) {
      // If audio isn't enabled yet, still collect the coin
      setIsCoinCollected(true);
    }
  };

  return (
    <span 
      className={`group inline-block relative ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      <span 
        className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:animate-coin-pop"
      >
        🟡
      </span>
      <span className={`transition-colors duration-300 group-hover:text-amber-400 ${isCoinCollected ? 'text-amber-400' : ''}`}>
        {text}
      </span>
    </span>
  );
} 