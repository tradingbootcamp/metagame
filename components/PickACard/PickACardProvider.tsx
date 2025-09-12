'use server'

import CardPicker from './CardPicker'

import { sessionsService } from '@/lib/db/sessions'

export default async function PickACard({
  sessionId,
  userId,
}: {
  sessionId: string
  userId: string
}) {
  const session = await sessionsService.getSessionById({ sessionId })
  if (!session) {
    return <div>Session not found</div>
  }
  if (!session.card_rewards || session.card_rewards.length === 0) {
    return <div>No cards found for this session</div>
  }
  return <CardPicker session={session} userId={userId} />
}
