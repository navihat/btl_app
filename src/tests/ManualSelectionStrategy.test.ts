import { describe, it, expect } from 'vitest'
import { ManualSelectionStrategy } from '../patterns/strategy/ManualSelectionStrategy'
import { makeQuestion } from './mocks/fixtures'

const strategy = new ManualSelectionStrategy()

describe('ManualSelectionStrategy', () => {
  const bank = [
    makeQuestion({ id: 'q-1', content: 'Câu 1' }),
    makeQuestion({ id: 'q-2', content: 'Câu 2' }),
    makeQuestion({ id: 'q-3', content: 'Câu 3' })
  ]

  it('TC10 – select() trả đúng danh sách câu theo selectedIds', () => {
    const result = strategy.select(bank, { selectedIds: ['q-1', 'q-3'] })
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('q-1')
    expect(result[1].id).toBe('q-3')
  })

  it('TC11 – select() throw khi id không tồn tại trong bank', () => {
    expect(() =>
      strategy.select(bank, { selectedIds: ['q-1', 'q-999'] })
    ).toThrow('q-999')
  })

  it('TC12 – select() trả mảng rỗng khi selectedIds rỗng', () => {
    const result = strategy.select(bank, { selectedIds: [] })
    expect(result).toHaveLength(0)
  })
})
