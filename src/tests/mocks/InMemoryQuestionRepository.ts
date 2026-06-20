import { Question, QuestionFilter } from '../../domain/entities/Question'
import { IQuestionRepository } from '../../domain/repositories/IQuestionRepository'

export class InMemoryQuestionRepository implements IQuestionRepository {
  private store: Question[] = []

  constructor(initial: Question[] = []) {
    this.store = [...initial]
  }

  async findAll(filter?: QuestionFilter): Promise<Question[]> {
    let result = [...this.store]
    if (filter?.difficulty) result = result.filter((q) => q.difficulty === filter.difficulty)
    if (filter?.topic) result = result.filter((q) => q.topic.toLowerCase().includes(filter.topic!.toLowerCase()))
    return result
  }

  async findById(id: string): Promise<Question | null> {
    return this.store.find((q) => q.id === id) ?? null
  }

  async save(question: Question): Promise<void> {
    this.store.push(question)
  }

  async update(question: Question): Promise<void> {
    const idx = this.store.findIndex((q) => q.id === question.id)
    if (idx !== -1) this.store[idx] = question
  }

  async delete(id: string): Promise<void> {
    this.store = this.store.filter((q) => q.id !== id)
  }

  getAll(): Question[] { return [...this.store] }
}
