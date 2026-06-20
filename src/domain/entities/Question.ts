export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard'
}

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  content: string
  options: QuestionOption[]
  correctOptionId: string
  difficulty: Difficulty
  topic: string
  createdAt: string
}

export interface CreateQuestionDTO {
  content: string
  options: Omit<QuestionOption, 'id'>[]
  correctOptionIndex: number
  difficulty: Difficulty
  topic: string
}

export interface UpdateQuestionDTO {
  content?: string
  options?: Omit<QuestionOption, 'id'>[]
  correctOptionIndex?: number
  difficulty?: Difficulty
  topic?: string
}

export interface QuestionFilter {
  difficulty?: Difficulty
  topic?: string
}
