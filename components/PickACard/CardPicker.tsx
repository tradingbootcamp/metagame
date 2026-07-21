'use client'

import { useMemo, useState } from 'react'

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
}: {
  session: DbFullSession
  user: DbPublicProfile
}) {
  const [selectedCard, setSelectedCard] = useState<DbCelestialCard | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [open, setOpen] = useState(true)
  const router = useRouter()

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

  // Shuffle a copy once (never session.card_rewards in place, and never during
  // render) so the grid doesn't reorder under the cursor on every state change
  const cards = useMemo(() => {
    const allCards = session.card_rewards
    const loserOption =
      allCards.find((card) =>
        card.details.some((detail) => detail.loser_option),
      ) ?? allCards[0]
    const shuffled =
      user.team === session.winning_team ? [...allCards] : [loserOption]
    // Fisher–Yates
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [session.card_rewards, session.winning_team, user.team])
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[90%]] mx-4 flex max-w-4xl flex-col !p-1 pb-6 sm:!max-w-4xl"
          style={{ maxWidth: '896px', width: 'calc(100vw - 2rem)' }}
          id="card-picker"
          showCloseButton={true}
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
            </div>
          </DialogDescription>
          <div className="grid max-h-[70vh] grid-cols-2 gap-4 self-center overflow-y-auto sm:grid-cols-4">
            <div
              role="button"
              tabIndex={0}
              aria-label="Keep your current card"
              className="flex w-fit cursor-pointer flex-col items-center justify-center bg-celestial-gold p-2 transition-colors hover:bg-celestial-gold/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => {
                setSelectedCard(null)
                setShowConfirmation(true)
              }}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelectedCard(null)
                  setShowConfirmation(true)
                }
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
              />
            </div>
            {cards.map((card) => (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                aria-label={`Transform your card into ${card.name}`}
                className="cursor-pointer transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => {
                  setSelectedCard(card)
                  setShowConfirmation(true)
                }}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedCard(card)
                    setShowConfirmation(true)
                  }
                }}
              >
                <PlayerCard
                  userId={user.id}
                  asCelestialCard={true}
                  overrideCelestialCard={card}
                  width={150}
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
