/// <reference types="vite/client" />

import type { Question, CreateQuestionDTO, UpdateQuestionDTO, QuestionFilter } from '../domain/entities/Question'
import type { Exam, CreateExamDTO } from '../domain/entities/Exam'

export {}

declare global {
  interface Window {
    api: {
      questionCreate: (data: CreateQuestionDTO) => Promise<Question>
      questionUpdate: (id: string, data: UpdateQuestionDTO) => Promise<Question>
      questionDelete: (id: string) => Promise<void>
      questionList: (filters?: QuestionFilter) => Promise<Question[]>

      examCreate: (data: CreateExamDTO) => Promise<Exam>
      examAddQuestions: (examId: string, questionIds: string[]) => Promise<Exam>
      examDelete: (id: string) => Promise<void>
      examList: () => Promise<Exam[]>
      examGet: (id: string) => Promise<Exam>
      appQuit: () => void
    }
  }
}
