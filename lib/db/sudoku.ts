import { createServiceClient } from '@/utils/supabase/service'

import {
  DbSudoku,
  DbSudokuInfo,
  DbTeamColor,
} from '@/types/database/dbTypeAliases'

export type SolveSudokuResponse = {
  solved: boolean
  isFirstSolve: boolean
  sudoku: Pick<DbSudoku, 'title' | 'solved_orange' | 'solved_purple'>
}
export const sudokuService = {
  getSudokus: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sudoku')
      .select('id, created_at, title, image_url, solved_orange, solved_purple')
    if (error) {
      throw new Error(error.message)
    }
    return data satisfies DbSudokuInfo[]
  },
  getSudokuById: async (id: string) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sudoku')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  getSudokuByTitle: async (title: string) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sudoku')
      .select('*')
      .eq('title', title)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
  solveSudoku: async ({
    title,
    solution,
    team,
  }: {
    title: string
    solution: string
    team: DbTeamColor | null
  }): Promise<SolveSudokuResponse> => {
    const sudoku = await sudokuService.getSudokuByTitle(title)
    if (!sudoku) {
      throw new Error('Sudoku not found')
    }
    const currentFlags = {
      title: sudoku.title,
      solved_orange: sudoku.solved_orange,
      solved_purple: sudoku.solved_purple,
    }
    if (sudoku.solution !== solution) {
      return { solved: false, isFirstSolve: false, sudoku: currentFlags }
    }
    if (team !== 'orange' && team !== 'purple') {
      // Correct, but there is no territory for this team to claim.
      return { solved: true, isFirstSolve: false, sudoku: currentFlags }
    }

    // Compare-and-swap: flip only this team's flag, and only while it is still
    // false. Writing the single column instead of the whole row read a moment
    // ago is what stops one team's solve from erasing the other's, and a
    // returned row means this request is the one that flipped it (META-428).
    const table = createServiceClient().from('sudoku')
    const claim =
      team === 'orange'
        ? table.update({ solved_orange: true }).eq('solved_orange', false)
        : table.update({ solved_purple: true }).eq('solved_purple', false)
    const { data, error } = await claim
      .eq('title', title)
      .select('title, solved_orange, solved_purple')
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    if (data) {
      return { solved: true, isFirstSolve: true, sudoku: data }
    }

    // Someone on this team already claimed it — re-read so the caller sees the
    // other team's flag as of now rather than as of our stale read.
    const settled = await sudokuService.getSudokuByTitle(title)
    return {
      solved: true,
      isFirstSolve: false,
      sudoku: settled
        ? {
            title: settled.title,
            solved_orange: settled.solved_orange,
            solved_purple: settled.solved_purple,
          }
        : currentFlags,
    }
  },
}
