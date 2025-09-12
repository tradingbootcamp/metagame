'use client'

import { useMemo, useState } from 'react'

import { CheckIcon } from 'lucide-react'

import { teamColorToBadgeClass } from '@/utils/dbUtils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

import { DbFullTicket } from '@/types/database/dbTypeAliases'

type ColumnConfig = {
  id: string
  header: string
  render: (ticket: DbFullTicket) => React.ReactNode
}

export default function CheckinTable({ tickets }: { tickets: DbFullTicket[] }) {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'claimed' | 'unclaimed'
  >('claimed')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<
    'owner_email' | 'owner_name' | 'purchaser_email' | 'purchaser_name'
  >('owner_name')

  // Get unique ticket types for filter
  const ticketTypes = useMemo(() => {
    const types = new Set(tickets.map((t) => t.ticket_type))
    return Array.from(types).sort()
  }, [tickets])

  // Filter and sort tickets based on selected filters
  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const statusMatch =
        filterStatus === 'all' ||
        (filterStatus === 'claimed' && ticket.owner_id) ||
        (filterStatus === 'unclaimed' && !ticket.owner_id)

      const typeMatch =
        filterType === 'all' || ticket.ticket_type === filterType

      return statusMatch && typeMatch
    })

    // Sort the filtered tickets
    return filtered.sort((a, b) => {
      let aValue = ''
      let bValue = ''

      switch (sortBy) {
        case 'owner_email':
          aValue = a.owner?.email || ''
          bValue = b.owner?.email || ''
          break
        case 'owner_name':
          aValue =
            `${a.owner?.first_name || ''} ${a.owner?.last_name || ''}`.trim()
          bValue =
            `${b.owner?.first_name || ''} ${b.owner?.last_name || ''}`.trim()
          break
        case 'purchaser_email':
          aValue = a.purchaser_email || ''
          bValue = b.purchaser_email || ''
          break
        case 'purchaser_name':
          aValue = a.purchaser_name || ''
          bValue = b.purchaser_name || ''
          break
      }

      return aValue.localeCompare(bValue)
    })
  }, [tickets, filterStatus, filterType, sortBy])

  // Statistics
  const stats = useMemo(() => {
    const claimed = tickets.filter((t) => t.owner_id).length
    const unclaimed = tickets.length - claimed
    const typeStats = ticketTypes.reduce(
      (acc, type) => {
        acc[type] = tickets.filter((t) => t.ticket_type === type).length
        return acc
      },
      {} as Record<string, number>,
    )

    return { claimed, unclaimed, total: tickets.length, typeStats }
  }, [tickets, ticketTypes])

  const columns: ColumnConfig[] = [
    {
      id: 'claimed_status',
      header: 'Claimed',
      render: (ticket) => (
        <div className="flex items-center justify-center">
          {ticket.owner_id ? (
            <CheckIcon className="h-4 w-4 text-green-600" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-orange-500"></div>
          )}
        </div>
      ),
    },
    {
      id: 'owner_name',
      header: 'Owner Name',
      render: (ticket) =>
        ticket.owner
          ? `${ticket.owner.first_name || ''} ${ticket.owner.last_name || ''}`.trim() ||
            'Unknown'
          : null,
    },
    {
      id: 'owner_email',
      header: 'Owner Email',
      render: (ticket) => ticket.owner?.email,
    },
    {
      id: 'ticket_type',
      header: 'Ticket Type',
      render: (ticket) => ticket.ticket_type,
    },
    {
      id: 'team',
      header: 'Team',
      render: (ticket) => (
        <div className="flex items-center justify-center">
          {ticket.owner?.team ? (
            <div
              className={`h-4 w-4 ${teamColorToBadgeClass(ticket.owner.team)}`}
            ></div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      id: 'purchaser_name',
      header: 'Purchaser Name',
      render: (ticket) => ticket.purchaser_name,
    },
    {
      id: 'purchaser_email',
      header: 'Purchaser Email',
      render: (ticket) => ticket.purchaser_email,
    },
    {
      id: 'created_at',
      header: 'Purchased',
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
    {
      id: 'volunteer',
      header: 'Volunteer',
      render: (ticket) => (
        <div className="flex items-center justify-center">
          {ticket.ticket_type === 'volunteer' ? (
            <CheckIcon className="h-4 w-4 text-green-600" />
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Tickets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.claimed}
          </div>
          <div className="text-sm text-muted-foreground">Claimed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.unclaimed}
          </div>
          <div className="text-sm text-muted-foreground">Unclaimed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {Math.round((stats.claimed / stats.total) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">Claimed Rate</div>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(stats.typeStats).map(([type, count]) => (
          <div key={type} className="text-center">
            <div className="text-lg font-semibold">{count}</div>
            <div className="text-sm text-muted-foreground capitalize">
              {type}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <div className="w-48">
          <label className="text-sm font-medium">Filter by status</label>
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="unclaimed">Unclaimed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium">Filter by type</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ticketTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium">Sort by</label>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as typeof sortBy)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner_name">Owner Name</SelectItem>
              <SelectItem value="owner_email">Owner Email</SelectItem>
              <SelectItem value="purchaser_name">Purchaser Name</SelectItem>
              <SelectItem value="purchaser_email">Purchaser Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      </div>

      {/* Table */}
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
          {filteredTickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="border-y border-border-primary"
            >
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
    </div>
  )
}
