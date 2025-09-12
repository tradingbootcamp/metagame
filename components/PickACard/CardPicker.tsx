'use client'

import { useState } from 'react'

import PlayerCard from '@/components/PlayerCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

import { useCardSelection } from '@/hooks/useCardSelection'
import { DbFullSession } from '@/types/database/dbTypeAliases'
import { DbCelestialCard } from '@/types/database/dbTypeAliases'

export default function CardPicker({
  session,
  userId,
  onClose,
}: {
  session: DbFullSession
  userId: string
  onClose?: () => void
}) {
  const cards = session.card_rewards
  const [selectedCard, setSelectedCard] = useState<DbCelestialCard | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { selectCard, isSelecting } = useCardSelection({
    userId,
    onSuccess: () => {
      setShowConfirmation(false)
      onClose?.()
    },
  })

  return (
    <>
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent
          className="w-[90%]] mx-4 flex max-w-4xl flex-col !p-1 pb-6 sm:!max-w-4xl"
          style={{ maxWidth: '896px', width: 'calc(100vw - 2rem)' }}
        >
          <DialogTitle>Pick a Card</DialogTitle>
          <DialogDescription>
            Your victory in {session.title} has earned you a reward! You may
            transform your card into any of the following, or keep your existing
            card.
          </DialogDescription>
          <div className="grid max-h-[70vh] grid-cols-2 gap-4 self-center overflow-y-auto sm:grid-cols-4">
            <div
              className="flex w-fit cursor-pointer flex-col items-center justify-center bg-celestial-gold p-2 transition-colors hover:bg-celestial-gold/80"
              onClick={() => {
                setSelectedCard(null)
                setShowConfirmation(true)
              }}
            >
              <span className="text-sm text-celestial-primary sm:text-xl">
                Keep Current
              </span>
              <PlayerCard
                userId={userId}
                asCelestialCard={true}
                overrideCelestialCard={null}
                width={150}
                showStatBoxes={true}
              />
            </div>
            {cards
              .sort(() => Math.random() - 0.5)
              .map((card) => (
                <div
                  key={card.id}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => {
                    setSelectedCard(card)
                    setShowConfirmation(true)
                  }}
                >
                  <PlayerCard
                    userId={userId}
                    asCelestialCard={true}
                    overrideCelestialCard={card}
                    width={150}
                    showStatBoxes={true}
                  />
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="mx-auto w-[95%] max-w-lg sm:max-w-2xl">
          <DialogTitle>Confirm Your Choice</DialogTitle>
          <DialogDescription>
            {selectedCard
              ? `Transform your card into "${selectedCard.name}"?`
              : 'Keep your current card?'}
          </DialogDescription>

          <div className="flex flex-col items-center justify-center gap-1 py-4 sm:flex-row sm:gap-4">
            {/* Current Card */}
            <div className="flex flex-col items-center">
              <span className="mb-2 text-sm text-muted-foreground">
                Current
              </span>
              <PlayerCard
                userId={userId}
                asCelestialCard={true}
                overrideCelestialCard={null}
                width={120}
                showStatBoxes={true}
              />
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <span className="rotate-90 text-2xl sm:rotate-0">→</span>
            </div>

            {/* New Card */}
            <div className="flex flex-col items-center">
              <span className="mb-2 text-sm text-muted-foreground">
                {selectedCard ? 'New' : 'Keeping'}
              </span>
              <PlayerCard
                userId={userId}
                asCelestialCard={true}
                overrideCelestialCard={selectedCard}
                width={120}
                showStatBoxes={true}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedCard) {
                  selectCard({
                    sessionId: session.id,
                    celestialCardId: selectedCard.id,
                  })
                } else {
                  // If keeping current card, just close
                  setShowConfirmation(false)
                  onClose?.()
                }
              }}
              disabled={isSelecting}
            >
              {isSelecting ? 'Selecting...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
