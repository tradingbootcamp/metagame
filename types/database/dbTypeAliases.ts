import {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/supabase.types'

export type DbSession = Tables<'sessions'>
export type DbSessionInsert = TablesInsert<'sessions'>
export type DbSessionUpdate = TablesUpdate<'sessions'>

export type DbFullSession = Tables<'sessions'> & {
  host_1: Pick<DbPublicProfile, 'first_name' | 'last_name'> | null
  host_2: Pick<DbPublicProfile, 'first_name' | 'last_name'> | null
  host_3: Pick<DbPublicProfile, 'first_name' | 'last_name'> | null
  bookmarks: Pick<DbSessionBookmark, 'user_id'>[]
  rsvps: (DbSessionRsvp & {
    user: Pick<DbPublicProfile, 'id' | 'team' | 'first_name' | 'last_name'>
  })[]
  location: Pick<DbLocation, 'name'> | null
}

export type DbSessionCategory = Enums<'SESSION_CATEGORY'>
export type DbSessionAges = Enums<'AGES'>
export type DbTicketType = Enums<'ticket_type'>

export type DbLocation = Tables<'locations'>
export type DbLocationInsert = TablesInsert<'locations'>
export type DbLocationUpdate = TablesUpdate<'locations'>

export type DbTicket = Tables<'tickets'>
export type DbTicketInsert = TablesInsert<'tickets'>
export type DbTicketUpdate = TablesUpdate<'tickets'>

export type DbFullProfile = Tables<'profiles'>
export type DbPublicProfileKeys =
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'team'
  | 'discord_handle'
  | 'opted_in_to_homepage_display'
  | 'bio'
  | 'is_admin'
  | 'homepage_order'
  | 'site_name'
  | 'site_url'
  | 'site_name_2'
  | 'site_url_2'
  | 'dismissed_info_request'
  | 'minor'
  | 'profile_pictures_url'
  | 'player_id'
  | 'pronouns'
export type DbPublicProfile = Pick<DbFullProfile, DbPublicProfileKeys>
export type DbProfileInsert = TablesInsert<'profiles'>
export type DbProfileUpdate = TablesUpdate<'profiles'>
export type DbTeamColor = Enums<'TEAM_COLORS'>

export type DbSessionRsvp = Tables<'session_rsvps'>
export type DbFullSessionRsvp = DbSessionRsvp & {
  user: Pick<DbPublicProfile, 'id' | 'team' | 'first_name' | 'last_name'>
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
