import { DummyTool } from './DummyTool'
import TicketsInfo from './TicketsInfo'
import CouponTool from './coupons/CouponTool'
import { IssueTicketForm } from './issue-tickets/IssueTicketForm'
import OpenNodeChargeTool from './opennode-charge/OpenNodeChargeTool'
import UserProfileTool from './user-profile/UserProfileTool'
import UserTeamsTool from './user-teams/UserTeamsTool'

export type AdminTool = {
  label: string
  menuDescription: string
  longDescription: string
  component: React.ComponentType<{
    searchParams?: Promise<Record<string, string | undefined>>
  }>
}
// Define the admin tools configuration as an object mapping
export const ADMIN_TOOLS = {
  'dummy-tool': {
    label: 'Dummy Tool',
    menuDescription: 'short menu description',
    longDescription:
      'Longer tool card description: this tool does nothing but take a couple of inputs and log them to the console with a toast message to show that the admin tool selector displays tools and performs actions.',
    component: DummyTool,
  },
  'issue-ticket': {
    label: 'Issue Ticket',
    menuDescription: 'Issue a ticket to a user',
    longDescription: 'Issue a ticket to a user',
    component: IssueTicketForm,
  },
  'tickets-info': {
    label: 'Tickets Info',
    menuDescription: 'View all tickets',
    longDescription: 'View all tickets and their stats',
    component: TicketsInfo,
  },
  'user-profile': {
    label: 'User Profile Viewer',
    menuDescription: 'View user profiles',
    longDescription:
      'Select and view detailed information for any user profile in the system',
    component: UserProfileTool,
  },
  'user-teams': {
    label: 'User Teams',
    menuDescription: 'View and assign teams',
    longDescription:
      'View users by team, reassign individuals, and bulk-assign teams.',
    component: UserTeamsTool,
  },
  'opennode-charge': {
    label: 'OpenNode Charge',
    menuDescription: 'Create a custom BTC charge',
    longDescription:
      'Create an OpenNode charge for an arbitrary BTC amount with purchaser details and ticket type. Posts to the /api/checkout/opennode route and validates via the OpenNodeCharge schema.',
    component: OpenNodeChargeTool,
  },
  coupons: {
    label: 'Coupons',
    menuDescription: 'Create and manage coupon codes',
    longDescription:
      'Create or update coupon codes, toggle enabled state, set global max uses, and manage allowed purchaser emails with per-email limits.',
    component: CouponTool,
  },
} satisfies Record<string, AdminTool>

export type AdminToolId = keyof typeof ADMIN_TOOLS
