import { Exam } from '../../domain/entities/Exam'
import { IExamObserver } from './IExamObserver'

/**
 * Observer pattern – Subject / Publisher (Person 4)
 *
 * ExamService giữ một instance của ExamSubject và gọi notify()
 * sau mỗi thao tác tạo / xóa đề thi.
 * Các observer (UI, logger, ...) đăng ký qua subscribe().
 */
export class ExamSubject {
  private observers: IExamObserver[] = []

  subscribe(observer: IExamObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer)
    }
  }

  unsubscribe(observer: IExamObserver): void {
    this.observers = this.observers.filter((o) => o !== observer)
  }

  notify(event: 'created' | 'deleted', exam: Exam): void {
    for (const observer of this.observers) {
      observer.update(event, exam)
    }
  }

  getObserverCount(): number {
    return this.observers.length
  }
}
