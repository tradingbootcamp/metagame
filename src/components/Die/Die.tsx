import { type DieValue } from './AnimatedDie';

export default function Die({ value }: { value: DieValue }) {
  return (
    <img 
      src={`/dice/dice-${value}.svg`} 
      alt={`Dice showing ${value}`}
      className="size-10"
    />
  );
}