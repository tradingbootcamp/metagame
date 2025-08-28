import {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/supabase.types'

export type DbSession = Tables<'sessions'>
export type DbSessionInsert = TablesInsert<'sessions'>
export type DbSessionUpdate = TablesUpdate<'sessions'>

export type FullDbSession = Tables<'sessions'> & {
  host_1: Pick<DbProfile, 'first_name' | 'last_name' | 'email'> | null
  host_2: Pick<DbProfile, 'first_name' | 'last_name' | 'email'> | null
  host_3: Pick<DbProfile, 'first_name' | 'last_name' | 'email'> | null
  bookmarks: Pick<DbSessionBookmark, 'user_id'>[]
  rsvps: (Pick<DbSessionRsvp, 'on_waitlist'> & {
    user: Pick<DbProfile, 'id' | 'team'>
  })[]
  location: Pick<DbLocation, 'name'> | null
}

export type DbSessionAges = Enums<'AGES'>
export type DbTicketType = Enums<'ticket_type'>

export type DbLocation = Tables<'locations'>
export type DbLocationInsert = TablesInsert<'locations'>
export type DbLocationUpdate = TablesUpdate<'locations'>

export type DbTicket = Tables<'tickets'>
export type DbTicketInsert = TablesInsert<'tickets'>
export type DbTicketUpdate = TablesUpdate<'tickets'>

export type DbProfile = Tables<'profiles'>
export type DbProfileInsert = TablesInsert<'profiles'>
export type DbProfileUpdate = TablesUpdate<'profiles'>
export type DbTeamColor = Enums<'TEAM_COLORS'>

export type DbSessionRsvp = Tables<'session_rsvps'>
export type DbFullSessionRsvp = DbSessionRsvp & {
  user: Pick<DbProfile, 'id' | 'team'>
}
export type DbSessionRsvpInsert = TablesInsert<'session_rsvps'>
export type DbSessionRsvpUpdate = TablesUpdate<'session_rsvps'>

export type DbSessionBookmark = Tables<'session_bookmarks'>
export type DbSessionBookmarkInsert = TablesInsert<'session_bookmarks'>
export type DbSessionBookmarkUpdate = TablesUpdate<'session_bookmarks'>

export type DbOpendnodeOrder = Tables<'opennode_orders'>
export type DbOpendnodeOrderInsert = TablesInsert<'opennode_orders'>
export type DbOpendnodeOrderUpdate = TablesUpdate<'opennode_orders'>

export type DbCoupon = Tables<'coupons'>
export type DbCouponInsert = TablesInsert<'coupons'>
export type DbCouponUpdate = TablesUpdate<'coupons'>
export type DbCouponEmail = Tables<'coupon_emails'>
export type DbCouponEmailInsert = TablesInsert<'coupon_emails'>
export type DbCouponEmailUpdate = TablesUpdate<'coupon_emails'>
