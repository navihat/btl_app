import { describe, it, expect, beforeEach } from 'vitest'
import { QuestionService } from '../domain/services/QuestionService'
import { QuestionFactory } from '../patterns/factory/QuestionFactory'
import { InMemoryQuestionRepository } from './mocks/InMemoryQuestionRepository'
import { Difficulty } from '../domain/entities/Question'
import { makeQuestion } from './mocks/fixtures'

function makeService(initial = [makeQuestion()]) {
  const repo = new InMemoryQuestionRepository(initial)
  const factory = new QuestionFactory()
  return { service: new QuestionService(repo, factory), repo }
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

  it('TC22 – deleteQuestion gọi repo.delete với đúng id', async () => {
    const q = makeQuestion({ id: 'q-del' })
    const { service, repo } = makeService([q])
    await service.deleteQuestion('q-del')
    expect(repo.getAll()).toHaveLength(0)
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
})
