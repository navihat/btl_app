import { describe, it, expect, beforeEach } from 'vitest'
import { QuestionService } from '../domain/services/QuestionService'
import { QuestionFactory } from '../patterns/factory/QuestionFactory'
import { InMemoryQuestionRepository } from './mocks/InMemoryQuestionRepository'
import { InMemoryExamRepository } from './mocks/InMemoryExamRepository'
import { Difficulty } from '../domain/entities/Question'
import { makeExam, makeQuestion } from './mocks/fixtures'

function makeService(initial = [makeQuestion()], exams = []) {
  const repo = new InMemoryQuestionRepository(initial)
  const examRepo = new InMemoryExamRepository(exams)
  const factory = new QuestionFactory()
  return { service: new QuestionService(repo, factory, examRepo), repo, examRepo }
}

const validDTO = {
  content: 'Hà Nội là thủ đô của quốc gia nào?',
  options: [{ text: 'Việt Nam' }, { text: 'Trung Quốc' }, { text: 'Nhật Bản' }, { text: 'Hàn Quốc' }],
  correctOptionIndex: 0,
  difficulty: Difficulty.Easy,
  topic: 'Địa lý'
}

describe('QuestionService', () => {
  it('TC18 – createQuestion trả về question với đủ fields', async () => {
    const { service } = makeService([])
    const q = await service.createQuestion(validDTO)
    expect(q.id).toBeTruthy()
    expect(q.content).toBe('Hà Nội là thủ đô của quốc gia nào?')
    expect(q.options).toHaveLength(4)
  })

  it('TC19 – createQuestion throw khi content rỗng', async () => {
    const { service } = makeService([])
    await expect(service.createQuestion({ ...validDTO, content: '' }))
      .rejects.toThrow('không được để trống')
  })

  it('TC20 – updateQuestion cập nhật đúng trường', async () => {
    const original = makeQuestion({ id: 'q-x' })
    const { service } = makeService([original])
    const updated = await service.updateQuestion('q-x', { topic: 'Lịch sử' })
    expect(updated.topic).toBe('Lịch sử')
    expect(updated.content).toBe(original.content)
  })

  it('TC21 – updateQuestion throw khi id không tồn tại', async () => {
    const { service } = makeService([])
    await expect(service.updateQuestion('not-exist', { topic: 'X' }))
      .rejects.toThrow('không tồn tại')
  })

  it('TC - updateQuestion throw khi thiếu correctOptionIndex khi update options', async () => {
    const q = makeQuestion({ id: 'q-x' })
    const { service } = makeService([q])
    await expect(service.updateQuestion('q-x', { options: [{text: 'A'},{text: 'B'},{text: 'C'},{text: 'D'}] }))
      .rejects.toThrow('Cần cung cấp correctOptionIndex')
  })

  it('TC - updateQuestion throw khi correctOptionIndex sai', async () => {
    const q = makeQuestion({ id: 'q-x' })
    const { service } = makeService([q])
    await expect(service.updateQuestion('q-x', { correctOptionIndex: 5 }))
      .rejects.toThrow('Chỉ số đáp án đúng không hợp lệ.')
  })

  it('TC - updateQuestion throw khi đáp án rỗng', async () => {
    const q = makeQuestion({ id: 'q-x' })
    const { service } = makeService([q])
    await expect(service.updateQuestion('q-x', {
      options: [{ text: 'A' }, { text: ' ' }, { text: 'C' }, { text: 'D' }],
      correctOptionIndex: 0
    })).rejects.toThrow('Nội dung đáp án không được để trống.')
  })

  it('TC - updateQuestion throw khi độ khó không hợp lệ', async () => {
    const q = makeQuestion({ id: 'q-x' })
    const { service } = makeService([q])
    await expect(service.updateQuestion('q-x', { difficulty: 'invalid' as Difficulty }))
      .rejects.toThrow('Độ khó không hợp lệ.')
  })

  it('TC22 – deleteQuestion gọi repo.delete với đúng id', async () => {
    const q = makeQuestion({ id: 'q-del' })
    const { service, repo } = makeService([q])
    await service.deleteQuestion('q-del')
    expect(repo.getAll()).toHaveLength(0)
  })

  it('TC - deleteQuestion throw khi id sai', async () => {
    const { service } = makeService([])
    await expect(service.deleteQuestion('wrong')).rejects.toThrow()
  })

  it('TC - deleteQuestion throw khi câu hỏi đang nằm trong đề thi', async () => {
    const q = makeQuestion({ id: 'q-used' })
    const exam = makeExam({ title: 'Đề đang dùng', questionIds: ['q-used'] })
    const { service, repo } = makeService([q], [exam])

    await expect(service.deleteQuestion('q-used'))
      .rejects.toThrow('Đề đang dùng')
    expect(repo.getAll()).toHaveLength(1)
  })

  it('TC23 – listQuestions filter theo difficulty', async () => {
    const qs = [
      makeQuestion({ id: 'q-1', difficulty: Difficulty.Easy }),
      makeQuestion({ id: 'q-2', difficulty: Difficulty.Hard }),
      makeQuestion({ id: 'q-3', difficulty: Difficulty.Easy })
    ]
    const { service } = makeService(qs)
    const result = await service.listQuestions({ difficulty: Difficulty.Easy })
    expect(result).toHaveLength(2)
    expect(result.every((q) => q.difficulty === Difficulty.Easy)).toBe(true)
  })

  it('TC24 – listQuestions filter theo topic', async () => {
    const qs = [
      makeQuestion({ id: 'q-1', topic: 'Toán học' }),
      makeQuestion({ id: 'q-2', topic: 'Vật lý' }),
      makeQuestion({ id: 'q-3', topic: 'Toán đại cương' })
    ]
    const { service } = makeService(qs)
    const result = await service.listQuestions({ topic: 'Toán' })
    expect(result).toHaveLength(2)
  })

  it('TC - getQuestion tra ve dung cau hoi', async () => {
    const q = makeQuestion({ id: 'q-1' })
    const { service } = makeService([q])
    const res = await service.getQuestion('q-1')
    expect(res).toEqual(q)
  })

  it('TC - getQuestion throw khi id sai', async () => {
    const { service } = makeService([])
    await expect(service.getQuestion('wrong')).rejects.toThrow()
  })
})
