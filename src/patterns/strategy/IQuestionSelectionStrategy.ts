import { Question } from '../../domain/entities/Question'

export interface SelectionCriteria {
  selectedIds: string[]
}

/**
 * Strategy pattern – Interface (Person 2)
 *
 * Tách thuật toán chọn câu hỏi ra khỏi ExamService.
 * OCP: thêm RandomSelectionStrategy hoặc ByTopicSelectionStrategy
 * mà không cần sửa ExamService.
 */
export interface IQuestionSelectionStrategy {
  select(bank: Question[], criteria: SelectionCriteria): Question[]
}
