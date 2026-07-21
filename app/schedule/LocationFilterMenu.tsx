'use client'

import { CheckIcon, FilterIcon, MinusIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function LocationFilterMenu({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const allSelected = selected.length === options.length
  const noneSelected = selected.length === 0
  const isFiltering = !allSelected

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  // Partial counts as "not all", so clicking it selects everything — the way back
  // to the unfiltered schedule is always one click
  const toggleAll = () =>
    onChange(allSelected ? [] : options.map((option) => option.value))

  const itemClass = 'cursor-pointer focus:bg-dark-400 focus:text-secondary-100'

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger
            className={`${isFiltering ? 'opacity-100' : 'opacity-50'} cursor-pointer rounded-sm p-0.5 transition-colors hover:bg-dark-300 hover:opacity-100`}
          >
            <FilterIcon
              fill={isFiltering ? 'currentColor' : 'none'}
              className="size-4 text-secondary-300"
            />
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {isFiltering ? 'Locations filtered' : 'Filter locations'}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="start"
        className="max-h-[60vh] overflow-y-auto border-secondary-300 bg-dark-600 font-serif text-secondary-200"
      >
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            toggleAll()
          }}
          className={`${itemClass} relative pl-8`}
        >
          <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
            {allSelected && <CheckIcon className="size-4" />}
            {!allSelected && !noneSelected && <MinusIcon className="size-4" />}
          </span>
          {allSelected ? 'Clear all' : 'Select all'}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-secondary-300" />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            // Keep the menu open so several locations can be picked in one go
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => toggle(option.value)}
            className={`${itemClass} group justify-between gap-6`}
          >
            <span>{option.label}</span>
            <span
              role="button"
              tabIndex={-1}
              title={`Show only ${option.label}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange([option.value])
              }}
              className="rounded-sm px-1 text-xs text-secondary-400 opacity-0 group-hover:opacity-100 hover:bg-dark-300 hover:text-secondary-100"
            >
              only
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
