import { useState } from 'react'

import SudokuSolutionInput from './SudokuSolutionInput'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { DbSudokuInfo } from '@/types/database/dbTypeAliases'

export default function SudokuAnswerDialog({
  sudoku,
  children,
}: {
  sudoku: DbSudokuInfo | null
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  if (!sudoku) {
    return <>{children}</>
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Solution:</DialogTitle>
        <SudokuSolutionInput
          sudoku={sudoku}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
