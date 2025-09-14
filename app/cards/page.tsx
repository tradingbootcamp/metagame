'use server'

import { celestialCardsService } from '@/lib/db/celestialCards'

import PlayerCard from '@/components/PlayerCard/PlayerCard'

export default async function CardsPage() {
  const allCards = await celestialCardsService.getAllCelestialCards()
  console.log(allCards)
  return (
    <div className="flex w-full flex-col items-center gap-4 pt-8">
      <span className="font-cinzel text-5xl font-bold">CARDS</span>
      <div className="flex max-w-6xl flex-wrap justify-center gap-2">
        {allCards.map((card) => (
          <div key={card.id}>
            <PlayerCard
              userId={null}
              asCelestialCard={true}
              overrideCelestialCard={card}
              width={150}
              tiltFactor={0.5}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
