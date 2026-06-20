import { Question, QuestionFilter } from '../entities/Question'

export interface IQuestionRepository {
  findAll(filter?: QuestionFilter): Promise<Question[]>
  findById(id: string): Promise<Question | null>
  save(question: Question): Promise<void>
  update(question: Question): Promise<void>
  delete(id: string): Promise<void>
}
