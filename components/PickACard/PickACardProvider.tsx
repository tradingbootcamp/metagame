'use server'

import CardPicker from './CardPicker'

import { sessionsService } from '@/lib/db/sessions'
import { usersService } from '@/lib/db/users'

export default async function PickACard({
  sessionId,
  userId,
  claimCreatedAt,
}: {
  sessionId: string
  userId: string
  claimCreatedAt: string
}) {
  const session = await sessionsService.getSessionById({ sessionId })
  const user = await usersService.getUserPublicProfileById({ userId })

  if (!user) {
    return <div>User not found</div>
  }
  if (!session) {
    return <div>Session not found</div>
  }
  if (!session.card_rewards || session.card_rewards.length === 0) {
    return <div>No cards found for this session</div>
  }
  return (
    <CardPicker session={session} user={user} claimCreatedAt={claimCreatedAt} />
  )
}
