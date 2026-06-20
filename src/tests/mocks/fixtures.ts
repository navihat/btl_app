import { Question, Difficulty } from '../../domain/entities/Question'
import { Exam } from '../../domain/entities/Exam'

export function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q-1',
    content: 'Câu hỏi mẫu?',
    options: [
      { id: 'o-1', text: 'Đáp án A' },
      { id: 'o-2', text: 'Đáp án B' },
      { id: 'o-3', text: 'Đáp án C' },
      { id: 'o-4', text: 'Đáp án D' }
    ],
    correctOptionId: 'o-1',
    difficulty: Difficulty.Easy,
    topic: 'Toán',
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

export function makeExam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: 'e-1',
    title: 'Đề thi mẫu',
    description: '',
    duration: 45,
    difficulty: Difficulty.Easy,
    questionIds: [],
    createdAt: new Date().toISOString(),
    ...overrides
  }
}
