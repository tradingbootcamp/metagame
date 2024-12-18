import { useStore } from '@nanostores/react';
import { coinCount, hasCollectedCoin } from '../stores/coinStore';

interface Props {
  alwaysShow?: boolean;  // Optional prop to force showing
}

export default function CoinCounter({ alwaysShow = false }: Props) {
  const coins = useStore(coinCount);
  const hasCollected = useStore(hasCollectedCoin);

  if (!alwaysShow && !hasCollected) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-amber-400">🟡</span>
      <span className="font-medium">{coins}</span>
    </div>
  );
}