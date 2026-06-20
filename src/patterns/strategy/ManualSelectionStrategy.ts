import { Question } from '../../domain/entities/Question'
import {
  IQuestionSelectionStrategy,
  SelectionCriteria
} from './IQuestionSelectionStrategy'

/**
 * Strategy pattern – Concrete Strategy: Manual Selection (Person 2)
 *
 * Giảng viên chọn thủ công từng câu hỏi theo id.
 * Throws nếu một id không tồn tại trong bank.
 */
export class ManualSelectionStrategy implements IQuestionSelectionStrategy {
  select(bank: Question[], criteria: SelectionCriteria): Question[] {
    const bankMap = new Map(bank.map((q) => [q.id, q]))

    return criteria.selectedIds.map((id) => {
      const question = bankMap.get(id)
      if (!question) {
        throw new Error(`Câu hỏi với id "${id}" không tồn tại trong ngân hàng.`)
      }
      return question
    })
  }
}
