import {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/supabase.types'

export type DbSession = Tables<'sessions'>
export type DbSessionInsert = TablesInsert<'sessions'>
export type DbSessionUpdate = TablesUpdate<'sessions'>
export type DbSessionView = Tables<'sessions_view'>

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
export type DbSessionRsvpWithTeam = DbSessionRsvp & {
  profiles: { team: DbProfile['team'] }
}
export type DbSessionRsvpInsert = TablesInsert<'session_rsvps'>
export type DbSessionRsvpUpdate = TablesUpdate<'session_rsvps'>
export type DbSessionRsvpView = Tables<'session_rsvps_view'>

export type DbSessionBookmark = Tables<'session_bookmarks'>
export type DbSessionBookmarkInsert = TablesInsert<'session_bookmarks'>
export type DbSessionBookmarkUpdate = TablesUpdate<'session_bookmarks'>

export type DbOpendnodeOrder = Tables<'opennode_orders'>
export type DbOpendnodeOrderInsert = TablesInsert<'opennode_orders'>
export type DbOpendnodeOrderUpdate = TablesUpdate<'opennode_orders'>

export type DbCoupon = Tables<'coupons'>
export type DbCouponInsert = TablesInsert<'coupons'>
export type DbCouponUpdate = TablesUpdate<'coupons'>
