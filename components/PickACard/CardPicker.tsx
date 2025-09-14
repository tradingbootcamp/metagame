'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import PlayerCard from '@/components/PlayerCard/PlayerCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

import { useCardSelection } from '@/hooks/useCardSelection'
import { DbFullSession, DbPublicProfile } from '@/types/database/dbTypeAliases'
import { DbCelestialCard } from '@/types/database/dbTypeAliases'

export default function CardPicker({
  session,
  user,
  claimCreatedAt,
}: {
  session: DbFullSession
  user: DbPublicProfile
  claimCreatedAt: string
}) {
  const [selectedCard, setSelectedCard] = useState<DbCelestialCard | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const router = useRouter()

  const CLAIM_WINDOW_MS = 2 * 60 * 60 * 1000 // 2 hours

  useEffect(() => {
    const updateTimer = () => {
      const claimTime = new Date(claimCreatedAt).getTime()
      const expirationTime = claimTime + CLAIM_WINDOW_MS
      const now = Date.now()
      const remaining = expirationTime - now

      if (remaining <= 0) {
        setTimeRemaining('Expired')
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [claimCreatedAt])
  const { selectCard, isSelecting } = useCardSelection({
    userId: user.id,
    onSuccess: () => {
      setTimeout(() => {
        setShowConfirmation(false)
        // Force server components to refetch, which should close the modal
        router.refresh()
      }, 2000)
    },
  })

  const winningTeam = session.winning_team
  const allCards = session.card_rewards
  const isWinner = user.team === winningTeam
  const loserOption =
    allCards.find((card) =>
      card.details.some((detail) => detail.loser_option),
    ) ?? allCards[0]
  const cards = isWinner ? allCards : [loserOption]
  return (
    <>
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent
          className="w-[90%]] mx-4 flex max-w-4xl flex-col !p-1 pb-6 sm:!max-w-4xl"
          style={{ maxWidth: '896px', width: 'calc(100vw - 2rem)' }}
          id="card-picker"
          showCloseButton={false}
        >
          <DialogTitle>Pick a Card</DialogTitle>
          <DialogDescription>
            Your victory in {session.title} has earned you a reward! You may
            transform your card into any of the following, or keep your existing
            card.
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-semibold">
                Time remaining to choose card:
              </span>
              <span
                className={`font-mono text-sm ${timeRemaining === 'Expired' ? 'text-red-500' : timeRemaining.includes('m') && !timeRemaining.includes('h') ? 'text-yellow-500' : 'text-green-500'}`}
              >
                {timeRemaining || 'Loading...'}
              </span>
            </div>
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
                userId={user.id}
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
                    userId={user.id}
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
                userId={user.id}
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
                userId={user.id}
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
                  selectCard({
                    sessionId: session.id,
                    celestialCardId:
                      user.celestial_card_id == null
                        ? 9999
                        : user.celestial_card_id,
                  })
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
