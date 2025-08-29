import type { TicketType } from '../lib/types'

import { TICKET_TYPES_ENUM } from '@/utils/dbUtils'
import { URLS } from '@/utils/urls'

import { DbTicketType } from '@/types/database/dbTypeAliases'

// Day pass options for the dropdown
export const DAY_PASS_OPTIONS: TicketType[] = [
  {
    id: 'friday',
    title: 'Friday',
    priceUSD: 150,
    live: true,
    applicationBased: false,
    priceBTC: 0.0011,
    description: 'Single day pass for Friday 9/12',
  },
  {
    id: 'saturday',
    title: 'Saturday',
    priceUSD: 250,
    priceBTC: 0.0018,
    live: true,
    applicationBased: false,
    description: 'Single day pass for Saturday 9/13',
  },
  {
    id: 'sunday',
    title: 'Sunday',
    priceUSD: 250,
    live: true,
    applicationBased: false,
    priceBTC: 0.0018,
    description: 'Single day pass for Sunday 9/14',
  },
]

export const TICKET_TYPES: Record<string, TicketType> = {
  volunteer: {
    id: 'volunteer',
    title: 'Volunteer',
    priceUSD: 0,
    live: true,
    applicationBased: true,
    ticketUrl: URLS.TICKET_VOLUNTEER,
    description:
      'Volunteer for 1-6 shifts for a free or reduced price ticket. May preclude participation in the megagame.',
    // features: [
    //   'Volunteer for 6 shifts over the weekend',
    //   'Access to all event activities',
    //   'NPC badge and materials'
    // ]
  },
  player: {
    id: 'player',
    title: 'Player',
    priceUSD: 580,
    priceBTC: 0.004,
    live: true,
    regularPrice: 580,
    applicationBased: false,
    description:
      'Full access to the event, including participating in the megagame',
    // features: [
    //   'Full access to all games and activities',
    //   'Event materials and swag',
    //   'Access to exclusive content'
    // ]
  },
  supporter: {
    id: 'supporter',
    title: 'Supporter',
    priceUSD: 2048,
    priceBTC: 0.016,
    regularPrice: 2048,
    applicationBased: false,
    live: true,
    description: 'We will name a game after you',
    // features: [
    //   'All Player benefits',
    //   'We will name a game after you',
    //   'Special recognition at the event',
    //   'VIP access to exclusive areas'
    // ]
  },
  student: {
    id: 'student',
    title: 'Student',
    priceUSD: 275,
    priceBTC: 0.002,
    live: true,
    regularPrice: 275,
    applicationBased: false,
    description: 'Student ticket',
  },
  dayPass: {
    id: 'dayPass',
    title: 'Day Pass',
    priceUSD: 150, // Default to Friday price, will be updated based on selection
    priceBTC: 0.0011,
    live: true,
    regularPrice: 150,
    applicationBased: false,
    description: 'Single day pass - choose your day',
  },
  financialAid: {
    id: 'financialAid',
    title: 'Financial Aid',
    ticketUrl: URLS.TICKET_FINANCIAL_AID,
    priceUSD: 0,
    live: true,
    regularPrice: 0,
    applicationBased: true,
    description: 'Financial assistance',
  },
}

export const getTicketType = (id: string): TicketType | null => {
  if (!TICKET_TYPES_ENUM.includes(id as DbTicketType)) {
    return null
  }
  return ['friday', 'saturday', 'sunday'].includes(id)
    ? getDayPassTicketType(id)
    : TICKET_TYPES[id]
}

export const getAllTicketTypes = (): TicketType[] => {
  return Object.values(TICKET_TYPES)
}

export const getDayPassTicketType = (id: string): TicketType | null => {
  return DAY_PASS_OPTIONS.find((option) => option.id === id) || null
}
