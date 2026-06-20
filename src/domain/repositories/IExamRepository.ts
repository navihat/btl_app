import { Exam } from '../entities/Exam'

export interface IExamRepository {
  findAll(): Promise<Exam[]>
  findById(id: string): Promise<Exam | null>
  save(exam: Exam): Promise<void>
  update(exam: Exam): Promise<void>
  delete(id: string): Promise<void>
}
