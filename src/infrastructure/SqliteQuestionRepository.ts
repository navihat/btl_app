import Database from 'better-sqlite3'
import { Question, QuestionOption, QuestionFilter } from '../domain/entities/Question'
import { IQuestionRepository } from '../domain/repositories/IQuestionRepository'

export class SqliteQuestionRepository implements IQuestionRepository {
  constructor(private readonly db: Database.Database) {}

  async findAll(filter?: QuestionFilter): Promise<Question[]> {
    let query = 'SELECT * FROM questions'
    const params: any[] = []
    const conditions: string[] = []

    if (filter?.difficulty) {
      conditions.push('difficulty = ?')
      params.push(filter.difficulty)
    }

    if (filter?.topic) {
      conditions.push('topic LIKE ?')
      params.push(`%${filter.topic}%`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const rows = this.db.prepare(query).all(...params) as any[]
    if (rows.length === 0) {
      return []
    }

    const questionIds = rows.map((r) => r.id)
    const placeholders = questionIds.map(() => '?').join(',')
    const allOptions = this.db.prepare(`
      SELECT id, questionId, text 
      FROM question_options 
      WHERE questionId IN (${placeholders}) 
      ORDER BY rowid ASC
    `).all(...questionIds) as any[]

    const optionsMap = new Map<string, QuestionOption[]>()
    for (const opt of allOptions) {
      if (!optionsMap.has(opt.questionId)) {
        optionsMap.set(opt.questionId, [])
      }
      optionsMap.get(opt.questionId)!.push({
        id: opt.id,
        text: opt.text
      })
    }

    return rows.map((r) => ({
      id: r.id,
      content: r.content,
      options: optionsMap.get(r.id) || [],
      correctOptionId: r.correctOptionId,
      difficulty: r.difficulty,
      topic: r.topic,
      createdAt: r.createdAt
    }))
  }

  async findById(id: string): Promise<Question | null> {
    const row = this.db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as any
    if (!row) {
      return null
    }

    const options = this.db.prepare(`
      SELECT id, text 
      FROM question_options 
      WHERE questionId = ? 
      ORDER BY rowid ASC
    `).all(id) as any[]

    return {
      id: row.id,
      content: row.content,
      options: options.map((o) => ({ id: o.id, text: o.text })),
      correctOptionId: row.correctOptionId,
      difficulty: row.difficulty,
      topic: row.topic,
      createdAt: row.createdAt
    }
  }

  async save(question: Question): Promise<void> {
    const insertQuestion = this.db.prepare(`
      INSERT INTO questions (id, content, correctOptionId, difficulty, topic, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const insertOption = this.db.prepare(`
      INSERT INTO question_options (id, questionId, text)
      VALUES (?, ?, ?)
    `)

    const transaction = this.db.transaction((q: Question) => {
      // Check if duplicate ID exists
      const existing = this.db.prepare('SELECT 1 FROM questions WHERE id = ?').get(q.id)
      if (existing) {
        throw new Error(`Câu hỏi với id "${q.id}" đã tồn tại.`)
      }

      insertQuestion.run(q.id, q.content, q.correctOptionId, q.difficulty, q.topic, q.createdAt)
      for (const opt of q.options) {
        insertOption.run(opt.id, q.id, opt.text)
      }
    })

    transaction(question)
  }

  async update(question: Question): Promise<void> {
    const updateQuestion = this.db.prepare(`
      UPDATE questions 
      SET content = ?, correctOptionId = ?, difficulty = ?, topic = ? 
      WHERE id = ?
    `)

    const deleteOptions = this.db.prepare('DELETE FROM question_options WHERE questionId = ?')
    const insertOption = this.db.prepare(`
      INSERT INTO question_options (id, questionId, text)
      VALUES (?, ?, ?)
    `)

    const transaction = this.db.transaction((q: Question) => {
      const result = updateQuestion.run(q.content, q.correctOptionId, q.difficulty, q.topic, q.id)
      if (result.changes === 0) {
        throw new Error(`Câu hỏi với id "${q.id}" không tìm thấy để cập nhật.`)
      }

      deleteOptions.run(q.id)
      for (const opt of q.options) {
        insertOption.run(opt.id, q.id, opt.text)
      }
    })

    transaction(question)
  }

  async delete(id: string): Promise<void> {
    const result = this.db.prepare('DELETE FROM questions WHERE id = ?').run(id)
    if (result.changes === 0) {
      throw new Error(`Câu hỏi với id "${id}" không tìm thấy để xóa.`)
    }
  }
}
