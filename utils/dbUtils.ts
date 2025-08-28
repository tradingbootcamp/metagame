import {
  DbFullSession,
  DbFullSessionRsvp,
  DbSessionAges,
  DbSessionCategory,
  DbTeamColor,
  DbTicketType,
} from '@/types/database/dbTypeAliases'

export const dbGetHostsFromSession = (session: DbFullSession) => {
  const host1Name = !session.host_1?.first_name
    ? ''
    : (session.host_1.first_name ?? '') + ' ' + (session.host_1.last_name ?? '')
  const host2Name = !session.host_2?.first_name
    ? ''
    : (session.host_2.first_name ?? '') + ' ' + (session.host_2.last_name ?? '')
  const host3Name = !session.host_3?.first_name
    ? ''
    : (session.host_3.first_name ?? '') + ' ' + (session.host_3.last_name ?? '')
  return [host1Name, host2Name, host3Name].filter((name) => !!name)
}

export const getAgesDisplayText = (ages: DbSessionAges | null): string => {
  switch (ages) {
    case 'ALL':
      return 'All Ages'
    case 'ADULTS':
      return '18+'
    case 'KIDS':
      return 'Great for Kids'
    default:
      return 'All Ages'
  }
}

export const SESSION_AGES = {
  ALL: 'ALL' as const,
  ADULTS: 'ADULTS' as const,
  KIDS: 'KIDS' as const,
} as const satisfies Record<Uppercase<DbSessionAges>, DbSessionAges>

export const SESSION_AGES_ENUM = Object.values(SESSION_AGES) as DbSessionAges[]

export const TEAM_COLORS = {
  ORANGE: 'orange' as const,
  PURPLE: 'purple' as const,
  GREEN: 'green' as const,
  UNASSIGNED: 'unassigned' as const,
} as const satisfies Record<Uppercase<DbTeamColor>, DbTeamColor>

export const TEAM_COLORS_ENUM = Object.values(TEAM_COLORS) as DbTeamColor[]

export const TICKET_TYPES = {
  VOLUNTEER: 'volunteer' as const,
  PLAYER: 'player' as const,
  SUPPORTER: 'supporter' as const,
  STUDENT: 'student' as const,
  FRIDAY: 'friday' as const,
  SATURDAY: 'saturday' as const,
  SUNDAY: 'sunday' as const,
} as const satisfies Record<Uppercase<DbTicketType>, DbTicketType>

export const TICKET_TYPES_ENUM = Object.values(TICKET_TYPES) as DbTicketType[]

export const SESSION_CATEGORIES = {
  TALK: 'talk' as const,
  WORKSHOP: 'workshop' as const,
  GAME: 'game' as const,
  OTHER: 'other' as const,
} as const satisfies Record<Uppercase<DbSessionCategory>, DbSessionCategory>

export const SESSION_CATEGORIES_ENUM = Object.values(
  SESSION_CATEGORIES,
) as DbSessionCategory[]

export const countRsvpsByTeamColor = (
  rsvps: Pick<DbFullSessionRsvp, 'user'>[],
) => {
  const counts = {
    purple: 0,
    orange: 0,
    green: 0,
    unassigned: 0,
  }

  rsvps.forEach((rsvp) => {
    const team = rsvp.user.team
    if (team === 'purple') {
      counts.purple++
    } else if (team === 'orange') {
      counts.orange++
    } else if (team === 'green') {
      counts.green++
    } else if (team === 'unassigned') {
      counts.unassigned++
    }
  })

  return counts
}

export const teamColorToBadgeClass = (team: DbTeamColor) => {
  switch (team) {
    case 'orange':
      return 'bg-orange-500'
    case 'purple':
      return 'bg-purple-500'
    case 'green':
      return 'bg-green-500'
    case 'unassigned':
      return 'bg-gray-500'
  }
}

export const teamColorToHex = (team: DbTeamColor): string => {
  switch (team) {
    case 'orange':
      return '#f97316' // orange-500
    case 'purple':
      return '#a855f7' // purple-500
    case 'green':
      return '#22c55e' // green-500
    case 'unassigned':
    default:
      return '#6b7280' // gray-500
  }
}
