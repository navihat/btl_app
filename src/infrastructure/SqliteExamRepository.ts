import Database from 'better-sqlite3'
import { Exam } from '../domain/entities/Exam'
import { IExamRepository } from '../domain/repositories/IExamRepository'

export class SqliteExamRepository implements IExamRepository {
  constructor(private readonly db: Database.Database) {}

  async findAll(): Promise<Exam[]> {
    const rows = this.db.prepare('SELECT * FROM exams').all() as any[]
    if (rows.length === 0) {
      return []
    }

    const examIds = rows.map((r) => r.id)
    const placeholders = examIds.map(() => '?').join(',')
    const allRelations = this.db.prepare(`
      SELECT examId, questionId 
      FROM exam_questions 
      WHERE examId IN (${placeholders})
    `).all(...examIds) as any[]

    const relationsMap = new Map<string, string[]>()
    for (const rel of allRelations) {
      if (!relationsMap.has(rel.examId)) {
        relationsMap.set(rel.examId, [])
      }
      relationsMap.get(rel.examId)!.push(rel.questionId)
    }

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? '',
      duration: Number(r.duration),
      difficulty: r.difficulty,
      questionIds: relationsMap.get(r.id) || [],
      createdAt: r.createdAt
    }))
  }

  async findById(id: string): Promise<Exam | null> {
    const row = this.db.prepare('SELECT * FROM exams WHERE id = ?').get(id) as any
    if (!row) {
      return null
    }

    const relations = this.db.prepare('SELECT questionId FROM exam_questions WHERE examId = ?').all(id) as any[]

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      duration: Number(row.duration),
      difficulty: row.difficulty,
      questionIds: relations.map((rel) => rel.questionId),
      createdAt: row.createdAt
    }
  }

  async save(exam: Exam): Promise<void> {
    const insertExam = this.db.prepare(`
      INSERT INTO exams (id, title, description, duration, difficulty, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const insertRelation = this.db.prepare(`
      INSERT INTO exam_questions (examId, questionId)
      VALUES (?, ?)
    `)

    const transaction = this.db.transaction((e: Exam) => {
      // Check if duplicate ID exists
      const existing = this.db.prepare('SELECT 1 FROM exams WHERE id = ?').get(e.id)
      if (existing) {
        throw new Error(`Đề thi với id "${e.id}" đã tồn tại.`)
      }

      insertExam.run(e.id, e.title, e.description, e.duration, e.difficulty, e.createdAt)
      for (const qId of e.questionIds) {
        insertRelation.run(e.id, qId)
      }
    })

    transaction(exam)
  }

  async update(exam: Exam): Promise<void> {
    const updateExam = this.db.prepare(`
      UPDATE exams 
      SET title = ?, description = ?, duration = ?, difficulty = ? 
      WHERE id = ?
    `)

    const deleteRelations = this.db.prepare('DELETE FROM exam_questions WHERE examId = ?')
    const insertRelation = this.db.prepare(`
      INSERT INTO exam_questions (examId, questionId)
      VALUES (?, ?)
    `)

    const transaction = this.db.transaction((e: Exam) => {
      const result = updateExam.run(e.title, e.description, e.duration, e.difficulty, e.id)
      if (result.changes === 0) {
        throw new Error(`Đề thi với id "${e.id}" không tìm thấy để cập nhật.`)
      }

      deleteRelations.run(e.id)
      for (const qId of e.questionIds) {
        insertRelation.run(e.id, qId)
      }
    })

    transaction(exam)
  }

  async delete(id: string): Promise<void> {
    const result = this.db.prepare('DELETE FROM exams WHERE id = ?').run(id)
    if (result.changes === 0) {
      throw new Error(`Đề thi với id "${id}" không tìm thấy để xóa.`)
    }
  }
}
