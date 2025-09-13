import { createServiceClient } from '@/utils/supabase/service'

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
  /** Does NOT do the validation of card choice */
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
    const { data, error } = await supabase
      .from('player_card_claims')
      .update({ new_card_id: newCardId })
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .select()
      .single()
    if (error) {
      throw new Error(error.message)
    }
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ celestial_card_id: newCardId })
      .eq('id', userId)
      .select()
      .single()
    if (updateError) {
      throw new Error(updateError.message)
    }
    return {
      playerCardClaim: data,
      updatedProfile,
    }
  },
}
