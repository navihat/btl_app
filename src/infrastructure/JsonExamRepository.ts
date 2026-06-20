import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { Exam } from '../domain/entities/Exam'
import { IExamRepository } from '../domain/repositories/IExamRepository'

interface ExamsStore {
  exams: Exam[]
}

/**
 * SRP: Lớp này chỉ chịu trách nhiệm đọc và ghi đề thi vào file JSON.
 * Không chứa bất kỳ business logic nào.
 */
export class JsonExamRepository implements IExamRepository {
  constructor(private readonly filePath: string) {
    this.ensureFile()
  }

  private ensureFile(): void {
    const dir = dirname(this.filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, JSON.stringify({ exams: [] }, null, 2), 'utf-8')
    }
  }

  private readStore(): ExamsStore {
    const raw = readFileSync(this.filePath, 'utf-8')
    return JSON.parse(raw) as ExamsStore
  }

  private writeStore(store: ExamsStore): void {
    writeFileSync(this.filePath, JSON.stringify(store, null, 2), 'utf-8')
  }

  async findAll(): Promise<Exam[]> {
    const store = this.readStore()
    return store.exams
  }

  async findById(id: string): Promise<Exam | null> {
    const store = this.readStore()
    return store.exams.find((e) => e.id === id) ?? null
  }

  async save(exam: Exam): Promise<void> {
    const store = this.readStore()
    store.exams.push(exam)
    this.writeStore(store)
  }

  async update(exam: Exam): Promise<void> {
    const store = this.readStore()
    const idx = store.exams.findIndex((e) => e.id === exam.id)
    if (idx === -1) {
      throw new Error(`Đề thi với id "${exam.id}" không tìm thấy để cập nhật.`)
    }
    store.exams[idx] = exam
    this.writeStore(store)
  }

  async delete(id: string): Promise<void> {
    const store = this.readStore()
    store.exams = store.exams.filter((e) => e.id !== id)
    this.writeStore(store)
  }
}
