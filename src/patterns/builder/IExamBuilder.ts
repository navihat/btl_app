import { Exam } from '../../domain/entities/Exam'
import { Difficulty } from '../../domain/entities/Question'

/**
 * Builder pattern – Interface (Person 3)
 *
 * Cho phép xây dựng đối tượng Exam theo từng bước,
 * đảm bảo các trường bắt buộc được kiểm tra tại build().
 */
export interface IExamBuilder {
  setTitle(title: string): this
  setDescription(description: string): this
  setDuration(minutes: number): this
  setDifficulty(difficulty: Difficulty | 'mixed'): this
  build(): Exam
  reset(): this
}
