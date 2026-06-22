import { describe, it, expect, beforeEach } from 'vitest'
import { ExamService } from '../domain/services/ExamService'
import { ExamBuilder } from '../patterns/builder/ExamBuilder'
import { ManualSelectionStrategy } from '../patterns/strategy/ManualSelectionStrategy'
import { ExamSubject } from '../patterns/observer/ExamSubject'
import { InMemoryQuestionRepository } from './mocks/InMemoryQuestionRepository'
import { InMemoryExamRepository } from './mocks/InMemoryExamRepository'
import { Difficulty } from '../domain/entities/Question'
import { makeQuestion, makeExam } from './mocks/fixtures'
import { CreateExamDTO } from '../domain/entities/Exam'

function makeService(questions = [makeQuestion()], exams = [makeExam()]) {
  const examRepo = new InMemoryExamRepository(exams)
  const questionRepo = new InMemoryQuestionRepository(questions)
  const builder = new ExamBuilder()
  const strategy = new ManualSelectionStrategy()
  const subject = new ExamSubject()
  const service = new ExamService(examRepo, questionRepo, builder, strategy, subject)
  return { service, examRepo, questionRepo, subject }
}

const validCreateDTO: CreateExamDTO = {
  title: 'Kiểm tra giữa kỳ',
  description: 'Đề thi chính thức',
  duration: 90,
  difficulty: Difficulty.Medium
}

describe('ExamService', () => {
  it('TC25 – createExam tạo đề qua ExamBuilder, lưu vào repo', async () => {
    const { service, examRepo } = makeService([], [])
    const exam = await service.createExam(validCreateDTO)

    expect(exam.id).toBeTruthy()
    expect(exam.title).toBe('Kiểm tra giữa kỳ')
    expect(exam.duration).toBe(90)
    expect(exam.questionIds).toEqual([])
    expect(examRepo.getAll()).toHaveLength(1)
  })

  it('TC26 – createExam throw khi title rỗng', async () => {
    const { service } = makeService([], [])
    await expect(service.createExam({ ...validCreateDTO, title: '' }))
      .rejects.toThrow('Tên đề thi')
  })

  it('TC27 – addQuestions thêm đúng số câu vào đề', async () => {
    const q1 = makeQuestion({ id: 'q-1' })
    const q2 = makeQuestion({ id: 'q-2' })
    const exam = makeExam({ id: 'e-1', questionIds: [] })
    const { service } = makeService([q1, q2], [exam])

    const updated = await service.addQuestions('e-1', ['q-1', 'q-2'])
    expect(updated.questionIds).toContain('q-1')
    expect(updated.questionIds).toContain('q-2')
    expect(updated.questionIds).toHaveLength(2)
  })

  it('TC28 – addQuestions throw khi questionId không tồn tại trong bank', async () => {
    const exam = makeExam({ id: 'e-1', questionIds: [] })
    const { service } = makeService([], [exam])
    await expect(service.addQuestions('e-1', ['q-nonexistent']))
      .rejects.toThrow('q-nonexistent')
  })

  it('TC - addQuestions throw khi examId sai', async () => {
    const { service } = makeService([], [])
    await expect(service.addQuestions('wrong', ['q-1'])).rejects.toThrow()
  })

  it('TC29 – addQuestions throw khi câu hỏi đã có trong đề (không trùng lặp)', async () => {
    const q1 = makeQuestion({ id: 'q-1' })
    const exam = makeExam({ id: 'e-1', questionIds: ['q-1'] })
    const { service } = makeService([q1], [exam])

    await expect(service.addQuestions('e-1', ['q-1']))
      .rejects.toThrow('đã tồn tại')
  })

  it('TC30 – deleteExam gọi repo.delete đúng id', async () => {
    const exam = makeExam({ id: 'e-del' })
    const { service, examRepo } = makeService([], [exam])
    await service.deleteExam('e-del')
    expect(examRepo.getAll()).toHaveLength(0)
  })

  it('TC31 – deleteExam throw khi exam không tồn tại', async () => {
    const { service } = makeService([], [])
    await expect(service.deleteExam('not-exist'))
      .rejects.toThrow('không tồn tại')
  })

  it('TC32 – createExam phát sự kiện "created" qua Observer', async () => {
    const { service, subject } = makeService([], [])
    let receivedEvent: string | null = null
    let receivedExam: any = null
    subject.subscribe({ update: (event, exam) => { receivedEvent = event; receivedExam = exam } })

    const exam = await service.createExam(validCreateDTO)
    expect(receivedEvent).toBe('created')
    expect(receivedExam).toEqual(exam)
  })

  it('TC - deleteExam phát sự kiện "deleted" qua Observer', async () => {
    const exam = makeExam({ id: 'e-del' })
    const { service, subject } = makeService([], [exam])
    let receivedEvent: string | null = null
    let receivedExam: any = null
    subject.subscribe({ update: (event, ex) => { receivedEvent = event; receivedExam = ex } })

    await service.deleteExam('e-del')
    expect(receivedEvent).toBe('deleted')
    expect(receivedExam).toEqual(exam)
  })

  it('TC - listExams trả về danh sách đề thi', async () => {
    const e1 = makeExam({ id: 'e-1' })
    const e2 = makeExam({ id: 'e-2' })
    const { service } = makeService([], [e1, e2])
    const list = await service.listExams()
    expect(list).toHaveLength(2)
  })

  it('TC - getExam trả về đúng đề thi', async () => {
    const e = makeExam({ id: 'e-1' })
    const { service } = makeService([], [e])
    const res = await service.getExam('e-1')
    expect(res).toEqual(e)
  })

  it('TC - getExam throw khi id sai', async () => {
    const { service } = makeService([], [])
    await expect(service.getExam('wrong')).rejects.toThrow()
  })
})
