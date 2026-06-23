import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SqliteDatabase } from '../infrastructure/SqliteDatabase'
import { SqliteQuestionRepository } from '../infrastructure/SqliteQuestionRepository'
import { SqliteExamRepository } from '../infrastructure/SqliteExamRepository'
import { Difficulty } from '../domain/entities/Question'
import { Question } from '../domain/entities/Question'
import { Exam } from '../domain/entities/Exam'

describe('SQLite Repositories Integration Tests', () => {
  let dbHelper: SqliteDatabase
  let questionRepo: SqliteQuestionRepository
  let examRepo: SqliteExamRepository

  beforeEach(() => {
    // Sử dụng in-memory database để test nhanh và độc lập
    dbHelper = new SqliteDatabase(':memory:')
    questionRepo = new SqliteQuestionRepository(dbHelper.getDb())
    examRepo = new SqliteExamRepository(dbHelper.getDb())
  })

  afterEach(() => {
    dbHelper.close()
  })

  describe('SqliteQuestionRepository', () => {
    const sampleQuestion: Question = {
      id: 'q-1',
      content: 'Thủ đô của Việt Nam là gì?',
      options: [
        { id: 'opt-0', text: 'Hà Nội' },
        { id: 'opt-1', text: 'Hải Phòng' },
        { id: 'opt-2', text: 'Đà Nẵng' },
        { id: 'opt-3', text: 'TP. Hồ Chí Minh' }
      ],
      correctOptionId: 'opt-0',
      difficulty: Difficulty.Easy,
      topic: 'Địa lý',
      createdAt: new Date().toISOString()
    }

    it('nên lưu và tìm thấy câu hỏi bằng ID', async () => {
      await questionRepo.save(sampleQuestion)

      const found = await questionRepo.findById('q-1')
      expect(found).not.toBeNull()
      expect(found!.id).toBe(sampleQuestion.id)
      expect(found!.content).toBe(sampleQuestion.content)
      expect(found!.options).toHaveLength(4)
      expect(found!.options[0].text).toBe('Hà Nội')
      expect(found!.correctOptionId).toBe('opt-0')
    })

    it('nên tìm thấy danh sách câu hỏi và lọc được theo độ khó/chủ đề', async () => {
      await questionRepo.save(sampleQuestion)
      await questionRepo.save({
        ...sampleQuestion,
        id: 'q-2',
        options: sampleQuestion.options.map((opt) => ({ ...opt, id: opt.id + '-2' })),
        correctOptionId: sampleQuestion.correctOptionId + '-2',
        difficulty: Difficulty.Hard,
        topic: 'Lịch sử'
      })

      const all = await questionRepo.findAll()
      expect(all).toHaveLength(2)

      const easyGeo = await questionRepo.findAll({ difficulty: Difficulty.Easy, topic: 'Địa' })
      expect(easyGeo).toHaveLength(1)
      expect(easyGeo[0].id).toBe('q-1')

      const hardHist = await questionRepo.findAll({ difficulty: Difficulty.Hard, topic: 'Lịch' })
      expect(hardHist).toHaveLength(1)
      expect(hardHist[0].id).toBe('q-2')
    })

    it('nên cập nhật câu hỏi thành công', async () => {
      await questionRepo.save(sampleQuestion)

      const updatedQuestion: Question = {
        ...sampleQuestion,
        content: 'Nội dung đã cập nhật',
        difficulty: Difficulty.Medium
      }

      await questionRepo.update(updatedQuestion)

      const found = await questionRepo.findById('q-1')
      expect(found!.content).toBe('Nội dung đã cập nhật')
      expect(found!.difficulty).toBe(Difficulty.Medium)
    })

    it('nên xóa câu hỏi và xóa cascade các options', async () => {
      await questionRepo.save(sampleQuestion)
      await questionRepo.delete('q-1')

      const found = await questionRepo.findById('q-1')
      expect(found).toBeNull()

      // Kiểm tra options trong DB thực sự đã bị xóa cascade
      const options = dbHelper.getDb().prepare('SELECT * FROM question_options WHERE questionId = ?').all('q-1')
      expect(options).toHaveLength(0)
    })
  })

  describe('SqliteExamRepository', () => {
    const sampleExam: Exam = {
      id: 'e-1',
      title: 'Đề thi cuối kỳ Địa lý',
      description: 'Mô tả đề thi',
      duration: 45,
      difficulty: 'mixed',
      questionIds: ['q-1', 'q-2'],
      createdAt: new Date().toISOString()
    }

    it('nên lưu và tìm thấy đề thi bằng ID', async () => {
      // Trước hết cần chèn các câu hỏi để không bị lỗi khóa ngoại khi liên kết (nếu có check, tuy nhiên exam_questions check RESTRICT tới questions)
      // Chèn questions trước
      const db = dbHelper.getDb()
      db.prepare("INSERT INTO questions VALUES ('q-1', 'Content 1', 'opt-0', 'easy', 'topic', 'date')").run()
      db.prepare("INSERT INTO questions VALUES ('q-2', 'Content 2', 'opt-1', 'easy', 'topic', 'date')").run()

      await examRepo.save(sampleExam)

      const found = await examRepo.findById('e-1')
      expect(found).not.toBeNull()
      expect(found!.title).toBe(sampleExam.title)
      expect(found!.questionIds).toEqual(['q-1', 'q-2'])
    })

    it('nên cập nhật đề thi thành công', async () => {
      const db = dbHelper.getDb()
      db.prepare("INSERT INTO questions VALUES ('q-1', 'Content 1', 'opt-0', 'easy', 'topic', 'date')").run()
      db.prepare("INSERT INTO questions VALUES ('q-2', 'Content 2', 'opt-1', 'easy', 'topic', 'date')").run()
      db.prepare("INSERT INTO questions VALUES ('q-3', 'Content 3', 'opt-2', 'easy', 'topic', 'date')").run()

      await examRepo.save(sampleExam)

      const updatedExam: Exam = {
        ...sampleExam,
        title: 'Tiêu đề mới',
        questionIds: ['q-2', 'q-3']
      }

      await examRepo.update(updatedExam)

      const found = await examRepo.findById('e-1')
      expect(found!.title).toBe('Tiêu đề mới')
      expect(found!.questionIds).toEqual(['q-2', 'q-3'])
    })

    it('nên xóa đề thi thành công', async () => {
      await examRepo.save({ ...sampleExam, questionIds: [] })
      await examRepo.delete('e-1')

      const found = await examRepo.findById('e-1')
      expect(found).toBeNull()
    })
  })
})
