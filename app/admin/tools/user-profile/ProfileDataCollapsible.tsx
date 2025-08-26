'use client'

import { useState } from 'react'

import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Textarea } from '@/components/ui/textarea'

import { DbProfile, DbTicket } from '@/types/database/dbTypeAliases'

interface ProfileDataCollapsibleProps {
  profile: DbProfile
  tickets: DbTicket[]
}

export function ProfileDataCollapsible({
  profile,
  tickets,
}: ProfileDataCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const combinedData = {
    ...profile,
    tickets,
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-md border border-gray-300">
        <CollapsibleTrigger className="text-lef flex w-full items-center justify-between rounded-md p-3">
          <span className="text-sm font-medium">Raw Profile Data</span>
          {isOpen ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <Textarea
            value={JSON.stringify(combinedData, null, 2)}
            readOnly
            className="min-h-64 font-mono text-xs"
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
