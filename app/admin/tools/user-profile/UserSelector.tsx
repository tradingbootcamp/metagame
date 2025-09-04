'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

interface UserSelectorProps {
  users: DbFullProfile[]
  selectedUserId: string | undefined
}

export function UserSelector({ users, selectedUserId }: UserSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleUserSelect = (userId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tool', 'user-profile')
    if (userId) {
      params.set('user_id', userId)
    } else {
      params.delete('user_id')
    }
    router.push(`?${params.toString()}`)
  }

  const clearSelection = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tool', 'user-profile')
    params.delete('user_id')
    router.push(`?${params.toString()}`)
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Select User</label>
      <div className="flex items-center gap-2">
        <Select value={selectedUserId || ''} onValueChange={handleUserSelect}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose a user to view their profile" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedUserId && (
          <button
            onClick={clearSelection}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
