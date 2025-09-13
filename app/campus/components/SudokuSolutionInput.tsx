'use client'

import { useState } from 'react'

import { submitSudokuSolution } from './actions'
import { CheckIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { SolveSudokuResponse } from '@/lib/db/sudoku'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { DbSudokuInfo } from '@/types/database/dbTypeAliases'

export default function SudokuSolutionInput({
  sudoku,
  closeDialog,
}: {
  sudoku: DbSudokuInfo
  closeDialog: () => void
}) {
  const router = useRouter()
  const [enteredSolution, setEnteredSolution] = useState('')
  const [solveResponse, setSolveResponse] =
    useState<SolveSudokuResponse | null>(null)
  const handleSubmit = async () => {
    const res = await submitSudokuSolution(sudoku.title, enteredSolution)
    setSolveResponse(res)
    solveToast(res)
    if (res.solved) {
      setTimeout(() => {
        closeDialog()
        router.refresh()
      }, 3000)
    }
  }
  const solveToast = (solveResponse: SolveSudokuResponse) => {
    if (solveResponse?.solved) {
      toast.success(
        solveResponse.isFirstSolve
          ? 'Correct! You are the first person on your team to solve this puzzle and have claimed territory.'
          : 'Correct!',
      )
    } else {
      toast.error('Incorrect solution :(')
    }
  }
  console.log('url', sudoku.image_url)
  return (
    <div className="flex flex-col items-center gap-2">
      <Image
        src={sudoku.image_url + '.png'}
        alt={sudoku.title + ' solution box'}
        width={250}
        height={45}
      />
      <div className="flex gap-4">
        <Input
          type="text"
          value={enteredSolution}
          onChange={(e) => setEnteredSolution(e.target.value)}
        />
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
      {solveResponse !== null &&
        (solveResponse.solved ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <XIcon className="h-4 w-4 text-red-500" />
        ))}
    </div>
  )
}
