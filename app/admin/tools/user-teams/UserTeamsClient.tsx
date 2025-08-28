'use client'

import { useMemo, useState } from 'react'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, MinusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { TEAM_COLORS_ENUM, teamColorToBadgeClass } from '@/utils/dbUtils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

import { adminUpdateUserProfile } from '@/app/actions/db/users'
import { ApiAllFullProfilesResponse } from '@/app/api/queries/profiles/route'

import { DbTeamColor } from '@/types/database/dbTypeAliases'

export default function UserTeamsClient() {
  const queryClient = useQueryClient()
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const profiles = await fetch('/api/queries/profiles')
      if (!profiles.ok) {
        throw new Error('Failed to load users')
      }
      return (await profiles.json()) as ApiAllFullProfilesResponse
    },
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterTeam, setFilterTeam] = useState<DbTeamColor | 'all'>('all')
  const [bulkTeam, setBulkTeam] = useState<DbTeamColor | ''>('')
  const [busy, setBusy] = useState(false)

  const visibleProfiles = useMemo(() => {
    if (filterTeam === 'all') return profiles
    return profiles.filter((p) => p.team === filterTeam)
  }, [profiles, filterTeam])

  const counts = useMemo(() => {
    const base = Object.fromEntries(
      TEAM_COLORS_ENUM.map((t) => [t, 0]),
    ) as Record<DbTeamColor, number>
    for (const p of profiles) {
      base[p.team] = (base[p.team] || 0) + 1
    }
    return base
  }, [profiles])

  const toggleSelect = (id: string, checked: boolean | 'indeterminate') => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  // Compute header checkbox state: checked | indeterminate | unchecked
  const allSelected =
    visibleProfiles.length > 0 &&
    visibleProfiles.every((p) => selectedIds.has(p.id))
  const noneSelected = visibleProfiles.every((p) => !selectedIds.has(p.id))
  const headerState: boolean | 'indeterminate' = allSelected
    ? true
    : noneSelected
      ? false
      : 'indeterminate'

  const handleHeaderToggle = () => {
    if (headerState === 'indeterminate' || headerState === true) {
      // Clear all selection among visible
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const p of visibleProfiles) next.delete(p.id)
        return next
      })
    } else {
      // Select all visible
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const p of visibleProfiles) next.add(p.id)
        return next
      })
    }
  }

  const updateOne = useMutation({
    mutationFn: async ({
      userId,
      team,
    }: {
      userId: string
      team: DbTeamColor
    }) => adminUpdateUserProfile({ userId, data: { team } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })

  const handleSetTeam = async (userId: string, team: DbTeamColor) => {
    setBusy(true)
    try {
      await updateOne.mutateAsync({ userId, team })
      const profile = profiles.find((p) => p.id === userId)
      toast.success(
        `Team updated to ${team} for ${profile?.first_name} ${profile?.last_name} (${profile?.email})`,
      )
    } catch {
      toast.error(`Failed to update team for ${userId}`)
    } finally {
      setBusy(false)
    }
  }

  const handleBulkAssign = async () => {
    if (bulkTeam === '') return
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBusy(true)
    try {
      await Promise.all(
        ids.map((userId) =>
          adminUpdateUserProfile({ userId, data: { team: bulkTeam } }),
        ),
      )
      await queryClient.invalidateQueries({ queryKey: ['profiles'] })
      setSelectedIds(new Set())
      setBulkTeam('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex flex-wrap gap-6">
        {TEAM_COLORS_ENUM.map((t) => (
          <div key={t} className="text-center">
            <div className="text-lg font-bold capitalize">{t}</div>
            <div>{counts[t] || 0}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-56">
            <label className="text-sm font-medium">Filter by team</label>
            <Select
              value={filterTeam}
              onValueChange={(v) => setFilterTeam(v as DbTeamColor | 'all')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {TEAM_COLORS_ENUM.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="w-56">
            <label className="text-sm font-medium">Assign team</label>
            <Select
              value={bulkTeam}
              onValueChange={(v) => setBulkTeam(v as DbTeamColor | '')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_COLORS_ENUM.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleBulkAssign}
            disabled={busy || selectedIds.size === 0 || bulkTeam === ''}
          >
            Assign to selected ({selectedIds.size})
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border-primary">
              <TableHead className="w-10">
                <div className="flex items-center justify-center">
                  <CheckboxPrimitive.Root
                    checked={headerState}
                    onCheckedChange={handleHeaderToggle}
                    className="peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary"
                  >
                    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current transition-none">
                      {headerState === 'indeterminate' ? (
                        <MinusIcon className="size-3.5" />
                      ) : (
                        <CheckIcon className="size-3.5" />
                      )}
                    </CheckboxPrimitive.Indicator>
                  </CheckboxPrimitive.Root>
                </div>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Team</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleProfiles.map((p) => (
              <TableRow key={p.id} className="border-y border-border-primary">
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedIds.has(p.id)}
                    onCheckedChange={(c) => toggleSelect(p.id, c)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {(p.first_name || '') + ' ' + (p.last_name || '')}
                </TableCell>
                <TableCell className="break-all">{p.email ?? ''}</TableCell>
                <TableCell>
                  <div className="w-40">
                    <Select
                      value={p.team}
                      onValueChange={(v) =>
                        handleSetTeam(p.id, v as DbTeamColor)
                      }
                      disabled={busy}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_COLORS_ENUM.map((t) => (
                          <SelectItem key={t} value={t}>
                            <Badge
                              variant="outline"
                              className={`${teamColorToBadgeClass(t)}`}
                            >
                              {t}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
