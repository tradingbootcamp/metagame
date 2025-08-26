import { CheckIcon } from 'lucide-react'

import { TICKET_TYPES_ENUM } from '@/utils/dbUtils'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { adminGetAllTickets } from '@/app/actions/db/tickets'

import { DbTicket, DbTicketType } from '@/types/database/dbTypeAliases'

export default async function TicketsInfo({}: {
  searchParams?: Promise<Record<string, string | undefined>>
} = {}) {
  const tickets = await adminGetAllTickets()

  return (
    <div>
      <TicketsStats tickets={tickets} />
      <TicketsTable tickets={tickets} />
    </div>
  )
}

const TicketsStats = ({ tickets }: { tickets: DbTicket[] }) => {
  const ticketTypeCounts = tickets.reduce(
    (acc, ticket) => {
      acc[ticket.ticket_type] = (acc[ticket.ticket_type] || 0) + 1
      return acc
    },
    {} as Record<DbTicketType, number>,
  )

  return (
    <div className="mb-8 flex justify-around">
      {TICKET_TYPES_ENUM.map((ticketType) => (
        <div key={ticketType} className="text-center">
          <div className="text-lg font-bold">{ticketType}</div>
          <div>{ticketTypeCounts[ticketType] || 0}</div>
        </div>
      ))}
    </div>
  )
}

type ColumnConfig = {
  id: string
  header: string
  render: (ticket: DbTicket) => React.ReactNode
}

const TicketsTable = ({ tickets }: { tickets: DbTicket[] }) => {
  const columns: ColumnConfig[] = [
    {
      id: 'ticket_type',
      header: 'Ticket Type',
      render: (ticket) => ticket.ticket_type,
    },
    {
      id: 'purchaser_email',
      header: 'Purchaser Email',
      render: (ticket) => ticket.purchaser_email,
    },
    {
      id: 'purchaser_name',
      header: 'Purchaser Name',
      render: (ticket) => ticket.purchaser_name,
    },
    {
      id: 'owner_id',
      header: 'Claimed?',
      render: (ticket) =>
        ticket.owner_id ? (
          <Tooltip>
            <TooltipTrigger className="flex size-full items-center justify-center">
              <CheckIcon className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>{ticket.owner_id}</TooltipContent>
          </Tooltip>
        ) : null,
    },
    {
      id: 'btc_paid',
      header: 'BTC Paid',
      render: (ticket) =>
        ticket.satoshis_paid
          ? (ticket.satoshis_paid / 100_000_000).toFixed(8)
          : null,
    },
    {
      id: 'price_paid',
      header: 'USD Paid',
      render: (ticket) =>
        ticket.price_paid ? `$${ticket.price_paid.toFixed(2)}` : null,
    },
    {
      id: 'admin_issued',
      header: 'Admin Issued',
      render: (ticket) =>
        ticket.admin_issued ? (
          <div className="flex size-full items-center justify-center">
            <CheckIcon className="size-4" />
          </div>
        ) : null,
    },
    {
      id: 'opennode_order',
      header: 'OpenNode Order ID',
      render: (ticket) => ticket.opennode_order,
    },
    {
      id: 'is_test',
      header: 'Test',
      render: (ticket) =>
        ticket.is_test ? (
          <div className="flex size-full items-center justify-center">
            <CheckIcon className="size-4" />
          </div>
        ) : null,
    },
    {
      id: 'created_at',
      header: 'Created At',
      render: (ticket) => (
        <Tooltip>
          <TooltipTrigger>
            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
          </TooltipTrigger>
          <TooltipContent>
            {new Date(ticket.created_at).toLocaleString()}
          </TooltipContent>
        </Tooltip>
      ),
    },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border-primary">
          {columns.map((column) => (
            <TableHead key={column.id} className="text-left">
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id} className="border-y border-border-primary">
            {columns.map((column) => (
              <TableCell
                key={column.id}
                className="border-x border-border-primary"
              >
                {column.render(ticket)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
