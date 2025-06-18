import type { TicketType } from '../lib/types';

export const TICKET_TYPES: Record<string, TicketType> = {
  npc: {
    id: 'npc',
    title: 'NPC',
    price: 2,
    description: 'Volunteer for 6 shifts over the weekend',
    features: [
      'Volunteer for 6 shifts over the weekend',
      'Access to all event activities',
      'NPC badge and materials'
    ]
  },
  player: {
    id: 'player',
    title: 'Player',
    price: 500,
    regularPrice: 650,
    description: 'Early bird price through July 9th, 2025',
    features: [
      'Full access to all games and activities',
      'Event materials and swag',
      'Access to exclusive content'
    ]
  },
  supporter: {
    id: 'supporter',
    title: 'Supporter',
    price: 2048,
    description: 'We will name a game after you',
    features: [
      'All Player benefits',
      'We will name a game after you',
      'Special recognition at the event',
      'VIP access to exclusive areas'
    ]
  }
};

export const getTicketType = (id: string): TicketType | null => {
  return TICKET_TYPES[id] || null;
};

export const getAllTicketTypes = (): TicketType[] => {
  return Object.values(TICKET_TYPES);
}; 