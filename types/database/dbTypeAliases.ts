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
  host_1: Pick<DbPublicProfile, 'first_name' | 'last_name' | 'id'> | null
  host_2: Pick<DbPublicProfile, 'first_name' | 'last_name' | 'id'> | null
  host_3: Pick<DbPublicProfile, 'first_name' | 'last_name' | 'id'> | null
  bookmarks: Pick<DbSessionBookmark, 'user_id'>[]
  rsvps: (DbSessionRsvp & {
    user: Pick<DbPublicProfile, 'id' | 'team' | 'first_name' | 'last_name'>
  })[]
  card_rewards: (DbCelestialCard & { details: { loser_option: boolean }[] })[]
  location: Pick<DbLocation, 'name' | 'map_info' | 'id'> | null
  megagame_location: Pick<DbMegagameLocation, 'id' | 'name'> | null
}

export type DbSessionCategory = Enums<'SESSION_CATEGORY'>
export type DbSessionAges = Enums<'AGES'>
export type DbTicketType = Enums<'ticket_type'>

export type DbLocation = Tables<'locations'>
export type DbLocationInsert = TablesInsert<'locations'>
export type DbLocationUpdate = TablesUpdate<'locations'>

export type DbMegagameLocation = Tables<'megagame_locations'>

export type DbTicket = Tables<'tickets'>
export type DbFullTicket = DbTicket & {
  owner: DbFullProfile | null
}
export type DbTicketInsert = TablesInsert<'tickets'>
export type DbTicketUpdate = TablesUpdate<'tickets'>

export type DbFullProfile = Tables<'profiles'> & {
  celestial_card: DbCelestialCard | null
}
export type DbPublicProfileKeys =
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'team'
  | 'opted_in_to_homepage_display'
  | 'bio'
  | 'homepage_order'
  | 'site_name'
  | 'site_url'
  | 'site_name_2'
  | 'site_url_2'
  | 'dismissed_info_request'
  | 'profile_pictures_url'
  | 'player_id'
  | 'pronouns'
  | 'volunteer'
  | 'celestial_card_id'
/** Fields of the public profile projection that only signed-in callers get: the
 * API strips them for anonymous requests, so they are optional on every reader. */
export type DbPrivateProfileKeys =
  | 'discord_handle'
  | 'is_admin'
  | 'minor'
  | 'checked_in'
export type DbPublicProfile = Pick<DbFullProfile, DbPublicProfileKeys> &
  Partial<Pick<DbFullProfile, DbPrivateProfileKeys>> & {
    celestial_card: DbCelestialCard | null
  }
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

export type DbSudoku = Tables<'sudoku'>
export type DbSudokuInfo = Omit<DbSudoku, 'solution'>
export type DbSudokuInsert = TablesInsert<'sudoku'>
export type DbSudokuUpdate = TablesUpdate<'sudoku'>

export type DbCelestialCard = Tables<'celestial_cards'>
export type DbCelestialCardInsert = TablesInsert<'celestial_cards'>
export type DbCelestialCardUpdate = TablesUpdate<'celestial_cards'>
