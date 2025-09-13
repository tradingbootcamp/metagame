'use server'

import { sudokuService } from '@/lib/db/sudoku'

import { getCurrentUserFullProfile } from '@/app/actions/db/users'

export const submitSudokuSolution = async (
  sudokuTitle: string,
  solution: string,
) => {
  const userProfile = await getCurrentUserFullProfile()
  const solutionResult = await sudokuService.solveSudoku({
    title: sudokuTitle,
    solution,
    team: userProfile?.team ?? null,
  })
  return solutionResult
}
