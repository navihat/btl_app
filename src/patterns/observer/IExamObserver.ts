import { Exam } from '../../domain/entities/Exam'

/**
 * Observer pattern – Observer Interface (Person 4)
 *
 * Bất kỳ lớp nào muốn lắng nghe sự kiện đề thi
 * đều phải implement interface này.
 */
export interface IExamObserver {
  update(event: 'created' | 'deleted', exam: Exam): void
}
