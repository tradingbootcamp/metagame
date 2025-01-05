import { atom } from 'nanostores';

export const coinCount = atom<number>(0);
export const hasCollectedCoin = atom<boolean>(false);

export function incrementCoins() {
  hasCollectedCoin.set(true);
  coinCount.set(coinCount.get() + 1);
} 