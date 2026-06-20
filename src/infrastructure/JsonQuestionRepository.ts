import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { Question, QuestionFilter } from '../domain/entities/Question'
import { IQuestionRepository } from '../domain/repositories/IQuestionRepository'

interface QuestionsStore {
  questions: Question[]
}

/**
 * SRP: Lớp này chỉ chịu trách nhiệm đọc và ghi câu hỏi vào file JSON.
 * Không chứa bất kỳ business logic nào.
 */
export class JsonQuestionRepository implements IQuestionRepository {
  constructor(private readonly filePath: string) {
    this.ensureFile()
  }

  private ensureFile(): void {
    const dir = dirname(this.filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, JSON.stringify({ questions: [] }, null, 2), 'utf-8')
    }
  }

  private readStore(): QuestionsStore {
    const raw = readFileSync(this.filePath, 'utf-8')
    return JSON.parse(raw) as QuestionsStore
  }

  private writeStore(store: QuestionsStore): void {
    writeFileSync(this.filePath, JSON.stringify(store, null, 2), 'utf-8')
  }

  async findAll(filter?: QuestionFilter): Promise<Question[]> {
    const store = this.readStore()
    let questions = store.questions

    if (filter?.difficulty) {
      questions = questions.filter((q) => q.difficulty === filter.difficulty)
    }

    if (filter?.topic) {
      questions = questions.filter((q) =>
        q.topic.toLowerCase().includes(filter.topic!.toLowerCase())
      )
    }

    return questions
  }

  async findById(id: string): Promise<Question | null> {
    const store = this.readStore()
    return store.questions.find((q) => q.id === id) ?? null
  }

  async save(question: Question): Promise<void> {
    const store = this.readStore()
    store.questions.push(question)
    this.writeStore(store)
  }

  async update(question: Question): Promise<void> {
    const store = this.readStore()
    const idx = store.questions.findIndex((q) => q.id === question.id)
    if (idx === -1) {
      throw new Error(`Câu hỏi với id "${question.id}" không tìm thấy để cập nhật.`)
    }
    store.questions[idx] = question
    this.writeStore(store)
  }

  async delete(id: string): Promise<void> {
    const store = this.readStore()
    store.questions = store.questions.filter((q) => q.id !== id)
    this.writeStore(store)
  }
}
