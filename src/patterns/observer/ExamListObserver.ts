import { Exam } from '../../domain/entities/Exam'
import { IExamObserver } from './IExamObserver'

/**
 * Observer pattern – Concrete Observer (Person 4)
 *
 * Lưu lại danh sách đề thi cập nhật trong bộ nhớ,
 * giúp UI hoặc các module khác có thể lấy snapshot mới nhất
 * mà không cần query lại repository.
 */
export class ExamListObserver implements IExamObserver {
  private exams: Exam[] = []
  private lastEvent: { type: 'created' | 'deleted'; exam: Exam } | null = null

  update(event: 'created' | 'deleted', exam: Exam): void {
    this.lastEvent = { type: event, exam }

    if (event === 'created') {
      this.exams.push(exam)
    } else if (event === 'deleted') {
      this.exams = this.exams.filter((e) => e.id !== exam.id)
    }
  }

  getExams(): Exam[] {
    return [...this.exams]
  }

  getLastEvent(): { type: 'created' | 'deleted'; exam: Exam } | null {
    return this.lastEvent
  }
}
