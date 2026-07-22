import { OpenNodeCharge } from 'opennode/dist/types/v1'

import { OpennodeChargeInput } from '@/lib/schemas/opennode'

import { createServiceClient } from '@/utils/supabase/service'

import { DbOpendnodeOrder } from '@/types/database/dbTypeAliases'

export const opennodeDbService = {
  createCharge: async ({
    charge,
    ticketDetails,
    isTest,
  }: {
    charge: OpenNodeCharge
    ticketDetails: OpennodeChargeInput['ticketDetails']
    /** Resolved by the route, not taken from ticketDetails — see the schema. */
    isTest: boolean
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('opennode_orders').insert({
      id: charge.order_id, //internal metagame order id
      opennode_order_id: charge.id,
      satoshis: charge.amount,
      status: charge.status,
      purchaser_email: ticketDetails.purchaserEmail,
      purchaser_name: ticketDetails.purchaserName,
      ticket_type: ticketDetails.ticketType,
      is_test: isTest,
    })
    if (error) {
      throw new Error(
        `Error inserting opennode order into db: ${error.message}`,
      )
    }
    return data
  },
  updateChargeStatus: async ({
    metagameOrderId,
    status,
    charge,
  }: {
    metagameOrderId: string
    status: DbOpendnodeOrder['status']
    charge?: OpenNodeCharge
  }) => {
    const supabase = createServiceClient()
    if (charge) {
      // Checked before the write, not after: an order whose row belongs to a
      // different charge must not have its status flipped at all.
      const { data: existing, error: existingError } = await supabase
        .from('opennode_orders')
        .select('opennode_order_id')
        .eq('id', metagameOrderId)
        .single()
      if (existingError) {
        throw new Error(
          `Error reading opennode order before status update: ${existingError.message}`,
        )
      }
      if (existing.opennode_order_id !== charge.id) {
        throw new Error(
          `Opennode order ${metagameOrderId} belongs to charge ${existing.opennode_order_id}, not ${charge.id}`,
        )
      }
    }
    const { data, error } = await supabase
      .from('opennode_orders')
      .update({ status })
      .eq('id', metagameOrderId)
      .select('*')
      .single()
    if (error) {
      throw new Error(`Error updating opennode order status: ${error.message}`)
    }
    return data
  },
  getChargeByOrderId: async ({ orderId }: { orderId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('opennode_orders')
      .select('*')
      .eq('id', orderId)
      .single()
    if (error) {
      throw new Error(
        `Error getting opennode order by order id: ${error.message}`,
      )
    }
    return data
  },
  getChargeStatus: async ({ orderId }: { orderId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('opennode_orders')
      .select('status')
      .eq('id', orderId)
      .single()
    if (error) {
      throw new Error(`Error getting opennode order status: ${error.message}`)
    }
    return data
  },
}
