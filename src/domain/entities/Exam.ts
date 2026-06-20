import { Difficulty } from './Question'

export interface Exam {
  id: string
  title: string
  description: string
  duration: number
  difficulty: Difficulty | 'mixed'
  questionIds: string[]
  createdAt: string
}

export interface CreateExamDTO {
  title: string
  description?: string
  duration: number
  difficulty: Difficulty | 'mixed'
}
