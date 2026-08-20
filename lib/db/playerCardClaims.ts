import { createServiceClient } from '@/utils/supabase/service'

/** How long after a win a player has to redeem their card reward. Server-owned:
 * it used to arrive as a caller-supplied argument. */
export const CARD_CLAIM_WINDOW_MS = 1000 * 60 * 60 * 24 * 5

export const playerCardClaimsService = {
  getPlayerCardClaims: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('player_card_claims')
      .select('*')
      .eq('user_id', userId)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  getPlayerCardClaimsByUserIdAndSessionId: async ({
    userId,
    sessionId,
  }: {
    userId: string
    sessionId: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('player_card_claims')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      /* Tolerate duplicate rows: nothing enforces uniqueness on
       * (user_id, session_id), and a bare .maybeSingle() errors on more than
       * one row, locking every attendee of that session out of claiming. */
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  getOpenPlayerCardClaimByUserIdAndSessionId: async ({
    userId,
    sessionId,
    timeWindow = 1000 * 60 * 10,
  }: {
    userId: string
    sessionId: string
    timeWindow?: number
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('player_card_claims')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .is('new_card_id', null)
      .gte('created_at', new Date(Date.now() - timeWindow).toISOString())
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getPlayerCardClaimsByUserId: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('player_card_claims')
      .select('*')
      .eq('user_id', userId)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getOpenPlayerCardClaimsByPlayerId: async ({
    userId,
    timeWindow,
  }: {
    userId: string
    timeWindow: number
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('player_card_claims')
      .select('*')
      .eq('user_id', userId)
      .is('new_card_id', null)
      .gte('created_at', new Date(Date.now() - timeWindow).toISOString())
      .order('created_at', { ascending: false })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  createOpenPlayerCardClaims: async ({
    userIds,
    sessionId,
  }: {
    userIds: string[]
    sessionId: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('player_card_claims')
      .insert(
        userIds.map((userId) => ({ user_id: userId, session_id: sessionId })),
      )
      .select()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  /** Does NOT do the validation of card choice. Returns null if the claim was
   * already redeemed (e.g. a second browser tab got there first). */
  makePlayerCardClaim: async ({
    userId,
    sessionId,
    newCardId,
  }: {
    userId: string
    sessionId: string
    newCardId: number
  }) => {
    const supabase = createServiceClient()
    // Compare-and-swap: whoever flips new_card_id off null owns the reward
    const { data: claims, error } = await supabase
      .from('player_card_claims')
      .update({ new_card_id: newCardId })
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .is('new_card_id', null)
      .select()
    if (error) {
      throw new Error(error.message)
    }
    const playerCardClaim = claims[0]
    if (!playerCardClaim) {
      return null
    }
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ celestial_card_id: newCardId })
      .eq('id', userId)
      .select()
      .single()
    if (updateError) {
      /* Reopen the claim: otherwise the reward is spent but the card never
       * landed, and new_card_id being set blocks any retry. */
      await supabase
        .from('player_card_claims')
        .update({ new_card_id: null })
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .eq('new_card_id', newCardId)
      throw new Error(updateError.message)
    }
    return {
      playerCardClaim,
      updatedProfile,
    }
  },
}
