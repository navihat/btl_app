import { describe, it, expect } from 'vitest'
import { QuestionFactory } from '../patterns/factory/QuestionFactory'
import { Difficulty } from '../domain/entities/Question'

const factory = new QuestionFactory()

const validDTO = {
  content: 'Thủ đô của Việt Nam là?',
  options: [
    { text: 'Hà Nội' },
    { text: 'TP.HCM' },
    { text: 'Đà Nẵng' },
    { text: 'Huế' }
  ],
  correctOptionIndex: 0,
  difficulty: Difficulty.Easy,
  topic: 'Địa lý'
}

describe('QuestionFactory', () => {
  it('TC01 – tạo Question hợp lệ với đầy đủ fields', () => {
    const q = factory.create(validDTO)
    expect(q.id).toBeTruthy()
    expect(q.content).toBe('Thủ đô của Việt Nam là?')
    expect(q.options).toHaveLength(4)
    expect(q.correctOptionId).toBe(q.options[0].id)
    expect(q.difficulty).toBe(Difficulty.Easy)
    expect(q.topic).toBe('Địa lý')
    expect(q.createdAt).toBeTruthy()
  })

  it('TC02 – sinh uuid duy nhất cho mỗi Question', () => {
    const q1 = factory.create(validDTO)
    const q2 = factory.create(validDTO)
    expect(q1.id).not.toBe(q2.id)
  })

  it('TC03 – throw khi options không đủ 4', () => {
    expect(() =>
      factory.create({ ...validDTO, options: [{ text: 'A' }, { text: 'B' }] })
    ).toThrow('4 đáp án')
  })

  it('TC04 – throw khi content rỗng', () => {
    expect(() =>
      factory.create({ ...validDTO, content: '  ' })
    ).toThrow('không được để trống')
  })

  it('TC05 – throw khi correctOptionIndex ngoài phạm vi', () => {
    expect(() =>
      factory.create({ ...validDTO, correctOptionIndex: 5 })
    ).toThrow('không hợp lệ')
  })
})
