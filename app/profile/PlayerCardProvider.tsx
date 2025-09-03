import { getSessionsHostedByUser } from '../actions/db/sessions'
import { getUserPublicProfileById } from '../actions/db/users'
import PlayerCard from './PlayerCard'

export const PlayerCardProvider = async ({ userId }: { userId: string }) => {
  const profile = await getUserPublicProfileById({ userId })
  const hostedSessions = await getSessionsHostedByUser({ userId })
  return <PlayerCard hostedSessions={hostedSessions} profile={profile} />
}
