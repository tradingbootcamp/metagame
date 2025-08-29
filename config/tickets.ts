import type { DisplayTicketType, TicketType } from '../lib/types'

import { URLS } from '@/utils/urls'

import { DbTicketType } from '@/types/database/dbTypeAliases'

export const ticketTypeDetails: Record<DbTicketType, TicketType> = {
  volunteer: {
    id: 'volunteer',
    title: 'Volunteer',
    priceUSD: 0,
    live: true,
    applicationBased: true,
    ticketUrl: URLS.TICKET_VOLUNTEER,
    description:
      'Volunteer for 1-6 shifts for a free or reduced price ticket. May preclude participation in the megagame.',
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
  friday: {
    id: 'friday',
    title: 'Friday',
    priceUSD: 150,
    live: true,
    applicationBased: false,
    priceBTC: 0.0011,
    description: 'Single day pass for Friday 9/12',
  },
  saturday: {
    id: 'saturday',
    title: 'Saturday',
    priceUSD: 250,
    priceBTC: 0.0018,
    live: true,
    applicationBased: false,
    description: 'Single day pass for Saturday 9/13',
  },
  sunday: {
    id: 'sunday',
    title: 'Sunday',
    priceUSD: 250,
    live: true,
    applicationBased: false,
    priceBTC: 0.0018,
    description: 'Single day pass for Sunday 9/14',
  },
}

export const displayOnlyTicketType: Record<string, DisplayTicketType> = {
  dayPass: {
    applicationBased: false,
    live: true,
    description: 'Day pass (select day)',
    title: 'Day Pass',
    id: 'dayPass',
    priceUSD: '150-250',
    priceBTC: '0.0011-0.0018',
  },
  slidingScale: {
    applicationBased: false,
    live: true,
    description: 'Player tickets at a pay-what-you-can rate',
    title: 'Sliding Scale',
    id: 'slidingScale',
    priceUSD: '290-580',
    priceBTC: '0.002-0.004',
  },
  volunteer: {
    ...ticketTypeDetails['volunteer'],
    priceUSD: '0+',
    priceBTC: '0+',
  },
}

export const usdSlidingScaleMinimum = 290
export const btcSlidingScaleMinimum = 0.002

export const dayPassTicketTypes: DbTicketType[] = [
  'friday',
  'saturday',
  'sunday',
]
export const isDayPassTicketType = (ticketTypeId: DbTicketType): boolean =>
  dayPassTicketTypes.includes(ticketTypeId)
