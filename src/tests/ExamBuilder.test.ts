import { describe, it, expect, beforeEach } from 'vitest'
import { ExamBuilder } from '../patterns/builder/ExamBuilder'
import { Difficulty } from '../domain/entities/Question'

describe('ExamBuilder', () => {
  let builder: ExamBuilder

  beforeEach(() => {
    builder = new ExamBuilder()
  })

  it('TC06 – build() trả về Exam hợp lệ khi đủ fields', () => {
    const exam = builder
      .setTitle('Đề giữa kỳ')
      .setDescription('Ghi chú gì đó')
      .setDuration(60)
      .setDifficulty(Difficulty.Medium)
      .build()

    expect(exam.id).toBeTruthy()
    expect(exam.title).toBe('Đề giữa kỳ')
    expect(exam.description).toBe('Ghi chú gì đó')
    expect(exam.duration).toBe(60)
    expect(exam.difficulty).toBe(Difficulty.Medium)
    expect(exam.questionIds).toEqual([])
    expect(exam.createdAt).toBeTruthy()
  })

  it('TC07 – build() throw khi chưa set title', () => {
    expect(() =>
      builder.setDuration(45).build()
    ).toThrow('Tên đề thi')
  })

  it('TC08 – build() throw khi duration <= 0', () => {
    expect(() =>
      builder.setTitle('Đề').setDuration(0).build()
    ).toThrow('Thời gian')
  })

  it('TC09 – reset() làm sạch state sau build()', () => {
    builder.setTitle('Đề A').setDuration(30).build()
    expect(() => builder.setDuration(10).build()).toThrow('Tên đề thi')
  })
})
