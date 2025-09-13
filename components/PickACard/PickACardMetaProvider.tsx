'use server'

import PickACard from './PickACardProvider'

import { currentUserLatestUnclaimedVictory } from '@/app/actions/db/users'

export default async function PickACardMetaProvider() {
  const unclaimedVictory = await currentUserLatestUnclaimedVictory({
    timeWindow: 1000 * 60 * 60 * 2,
  })
  if (!unclaimedVictory) {
    return null
  }
  return (
    <PickACard
      sessionId={unclaimedVictory.session_id}
      userId={unclaimedVictory.user_id}
    />
  )
}
