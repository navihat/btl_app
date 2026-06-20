import { Question, CreateQuestionDTO } from '../../domain/entities/Question'

/**
 * Factory Method pattern – Person 2
 *
 * Định nghĩa interface cho việc tạo đối tượng Question.
 * Cho phép thay thế hoặc mở rộng cách tạo Question (OCP)
 * mà không ảnh hưởng đến QuestionService (DIP).
 */
export interface IQuestionFactory {
  create(data: CreateQuestionDTO): Question
}
