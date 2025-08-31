import { SESSION_CATEGORIES } from '@/utils/dbUtils'

import { DbSessionCategory } from '@/types/database/dbTypeAliases'

export const sessionCategoryColors: Record<DbSessionCategory, string> = {
  [SESSION_CATEGORIES.TALK]: 'bg-blue-100 border-blue-200',
  [SESSION_CATEGORIES.WORKSHOP]: 'bg-rose-100 border-rose-200',
  [SESSION_CATEGORIES.GAME]: 'bg-emerald-100 border-emerald-200',
  [SESSION_CATEGORIES.OTHER]: 'bg-slate-100 border-slate-200',
}

const sessionCategoryRSVPdColors: Record<DbSessionCategory, string> = {
  [SESSION_CATEGORIES.TALK]: 'bg-blue-200 border-blue-300',
  [SESSION_CATEGORIES.WORKSHOP]: 'bg-rose-200 border-rose-300',
  [SESSION_CATEGORIES.GAME]: 'bg-emerald-200 border-emerald-300',
  [SESSION_CATEGORIES.OTHER]: 'bg-slate-200 border-slate-300',
}

const megagameColors = {
  rsvpd:
    'bg-[repeating-linear-gradient(45deg,#fb923c,#fb923c_10px,#a855f7_10px,#a855f7_20px)] border-none',
  notRsvpd:
    'bg-[repeating-linear-gradient(45deg,#fed7aa,#fed7aa_10px,#d8b4fe_10px,#d8b4fe_20px)] border-none',
}

const kidsColors = {
  rsvpd: 'bg-yellow-200 border-yellow-300',
  notRsvpd: 'bg-yellow-100 border-yellow-200',
}

export const scheduleColors = {
  rsvpd: {
    category: sessionCategoryRSVPdColors,
    kids: kidsColors.rsvpd,
    megagame: megagameColors.rsvpd,
  },
  notRsvpd: {
    category: sessionCategoryColors,
    kids: kidsColors.notRsvpd,
    megagame: megagameColors.notRsvpd,
  },
}
