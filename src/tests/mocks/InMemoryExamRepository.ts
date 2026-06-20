import { Exam } from '../../domain/entities/Exam'
import { IExamRepository } from '../../domain/repositories/IExamRepository'

export class InMemoryExamRepository implements IExamRepository {
  private store: Exam[] = []

  constructor(initial: Exam[] = []) {
    this.store = [...initial]
  }

  async findAll(): Promise<Exam[]> {
    return [...this.store]
  }

  async findById(id: string): Promise<Exam | null> {
    return this.store.find((e) => e.id === id) ?? null
  }

  async save(exam: Exam): Promise<void> {
    this.store.push(exam)
  }

  async update(exam: Exam): Promise<void> {
    const idx = this.store.findIndex((e) => e.id === exam.id)
    if (idx !== -1) this.store[idx] = exam
  }

  async delete(id: string): Promise<void> {
    this.store = this.store.filter((e) => e.id !== id)
  }

  getAll(): Exam[] { return [...this.store] }
}
