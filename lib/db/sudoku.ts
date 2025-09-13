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
  getSudokuSolutions: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('sudoku').select('*')
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
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
    const supabase = createServiceClient()
    const sudoku = await sudokuService.getSudokuByTitle(title)
    if (!sudoku) {
      throw new Error('Sudoku not found')
    }
    if (sudoku.solution !== solution) {
      return {
        solved: false,
        isFirstSolve: false,
        sudoku: {
          title: sudoku.title,
          solved_orange: sudoku.solved_orange,
          solved_purple: sudoku.solved_purple,
        },
      }
    }
    const newSolvedOrange = sudoku.solved_orange || team === 'orange'
    const newSolvedPurple = sudoku.solved_purple || team === 'purple'
    const isFirstSolve =
      (team === 'orange' && !sudoku.solved_orange) ||
      (team === 'purple' && !sudoku.solved_purple)
    const { data, error } = await supabase
      .from('sudoku')
      .update({
        solution,
        solved_orange: newSolvedOrange,
        solved_purple: newSolvedPurple,
      })
      .eq('title', title)
      .select()
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return {
      solved: true,
      isFirstSolve,
      sudoku: {
        title: data.title,
        solved_orange: data.solved_orange,
        solved_purple: data.solved_purple,
      },
    }
  },
}
