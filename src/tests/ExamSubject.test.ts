import { describe, it, expect, vi } from 'vitest'
import { ExamSubject } from '../patterns/observer/ExamSubject'
import { ExamListObserver } from '../patterns/observer/ExamListObserver'
import { IExamObserver } from '../patterns/observer/IExamObserver'
import { makeExam } from './mocks/fixtures'

describe('ExamSubject (Observer Pattern)', () => {
  it('TC13 – notify("created") gọi update trên tất cả subscriber', () => {
    const subject = new ExamSubject()
    const obs: IExamObserver = { update: vi.fn() }
    subject.subscribe(obs)

    const exam = makeExam()
    subject.notify('created', exam)

    expect(obs.update).toHaveBeenCalledWith('created', exam)
    expect(obs.update).toHaveBeenCalledTimes(1)
  })

  it('TC14 – notify("deleted") gọi update trên tất cả subscriber', () => {
    const subject = new ExamSubject()
    const obs1: IExamObserver = { update: vi.fn() }
    const obs2: IExamObserver = { update: vi.fn() }
    subject.subscribe(obs1)
    subject.subscribe(obs2)

    const exam = makeExam()
    subject.notify('deleted', exam)

    expect(obs1.update).toHaveBeenCalledWith('deleted', exam)
    expect(obs2.update).toHaveBeenCalledWith('deleted', exam)
  })

  it('TC15 – unsubscribe xong thì không nhận event', () => {
    const subject = new ExamSubject()
    const obs: IExamObserver = { update: vi.fn() }
    subject.subscribe(obs)
    subject.unsubscribe(obs)

    subject.notify('created', makeExam())

    expect(obs.update).not.toHaveBeenCalled()
  })

  it('TC16 – ExamListObserver cập nhật danh sách khi nhận created', () => {
    const subject = new ExamSubject()
    const listObs = new ExamListObserver()
    subject.subscribe(listObs)

    const exam = makeExam({ id: 'e-10', title: 'Đề A' })
    subject.notify('created', exam)

    expect(listObs.getExams()).toHaveLength(1)
    expect(listObs.getExams()[0].id).toBe('e-10')
    expect(listObs.getLastEvent()?.type).toBe('created')
  })

  it('TC17 – ExamListObserver xóa đề khỏi danh sách khi nhận deleted', () => {
    const subject = new ExamSubject()
    const listObs = new ExamListObserver()
    subject.subscribe(listObs)

    const exam = makeExam({ id: 'e-10' })
    subject.notify('created', exam)
    subject.notify('deleted', exam)

    expect(listObs.getExams()).toHaveLength(0)
  })
})
