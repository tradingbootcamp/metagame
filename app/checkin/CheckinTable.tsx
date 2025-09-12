'use client'

import { useMemo, useState } from 'react'

import { useCheckin } from './useCheckin'
import { CheckIcon } from 'lucide-react'
import Image from 'next/image'

import { teamColorToBadgeClass } from '@/utils/dbUtils'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

type ConfirmationState = {
  isOpen: boolean
  ticket: DbFullTicket | null
  newCheckedInStatus: boolean
}

export default function CheckinTable({ tickets }: { tickets: DbFullTicket[] }) {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'claimed' | 'unclaimed'
  >('claimed')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<
    'owner_email' | 'owner_name' | 'purchaser_email' | 'purchaser_name'
  >('owner_name')
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    ticket: null,
    newCheckedInStatus: false,
  })

  const { updateCheckinStatus, isUpdating } = useCheckin()

  const handleCheckinChange = (ticket: DbFullTicket, checked: boolean) => {
    if (!ticket.owner) return

    setConfirmation({
      isOpen: true,
      ticket,
      newCheckedInStatus: checked,
    })
  }

  const confirmCheckinChange = async () => {
    if (!confirmation.ticket?.owner) return

    await updateCheckinStatus.mutateAsync({
      userId: confirmation.ticket.owner.id,
      checked_in: confirmation.newCheckedInStatus,
    })
    setConfirmation({
      isOpen: false,
      ticket: null,
      newCheckedInStatus: false,
    })
  }

  const cancelCheckinChange = () => {
    setConfirmation({ isOpen: false, ticket: null, newCheckedInStatus: false })
  }

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
      id: 'checked_in',
      header: 'Checked In',
      render: (ticket) => (
        <div className="flex items-center justify-center">
          {!ticket.owner ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Checkbox checked={false} disabled={true} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Cannot check in a ticket that hasn&apos;t been claimed
              </TooltipContent>
            </Tooltip>
          ) : (
            <Checkbox
              checked={ticket.owner.checked_in || false}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handleCheckinChange(ticket, checked as boolean)
              }
            />
          )}
        </div>
      ),
    },
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmation.isOpen} onOpenChange={cancelCheckinChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">
              {confirmation.newCheckedInStatus ? 'Check In' : 'Check Out'}{' '}
              Confirmation
            </DialogTitle>
            <DialogDescription className="mt-2 text-base">
              {confirmation.newCheckedInStatus
                ? 'Please confirm you want to check in this attendee'
                : "Please confirm you want to reverse this attendee's check-in status"}
            </DialogDescription>
          </DialogHeader>

          {confirmation.ticket?.owner && (
            <div className="flex flex-col items-center space-y-4 py-6">
              {confirmation.ticket.owner.profile_pictures_url ? (
                <Image
                  src={confirmation.ticket.owner.profile_pictures_url}
                  alt="Profile"
                  width={180}
                  height={180}
                  className="rounded-full border-4 border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-45 w-45 items-center justify-center rounded-full border-4 border-gray-300 bg-gray-200">
                  <span className="text-6xl font-bold text-gray-600">
                    {confirmation.ticket.owner.first_name?.[0]?.toUpperCase() ||
                      '?'}
                  </span>
                </div>
              )}

              <div className="flex flex-col items-center space-y-1 text-center">
                <h3 className="text-xl font-bold">
                  {confirmation.ticket.owner.first_name}{' '}
                  {confirmation.ticket.owner.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {confirmation.ticket.owner.email}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="capitalize">
                    {confirmation.ticket.ticket_type}
                  </span>
                  {confirmation.ticket.owner.team && (
                    <>
                      <span>•</span>
                      <div
                        className={`h-4 w-4 ${teamColorToBadgeClass(confirmation.ticket.owner.team)}`}
                      ></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={cancelCheckinChange}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCheckinChange}
              disabled={isUpdating}
              variant={
                confirmation.newCheckedInStatus ? 'default' : 'destructive'
              }
              className="flex-1"
            >
              {isUpdating
                ? 'Updating...'
                : confirmation.newCheckedInStatus
                  ? 'Confirm Check In'
                  : 'Confirm Check Out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
