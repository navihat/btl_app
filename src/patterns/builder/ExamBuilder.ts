import { v4 as uuidv4 } from 'uuid'
import { Exam } from '../../domain/entities/Exam'
import { Difficulty } from '../../domain/entities/Question'
import { IExamBuilder } from './IExamBuilder'

/**
 * Builder pattern – Concrete Builder (Person 3)
 *
 * Xây dựng đối tượng Exam từng bước với method chaining.
 * Validates trước khi build() để đảm bảo tính toàn vẹn dữ liệu.
 *
 * SRP: Chỉ chịu trách nhiệm khởi tạo và validate cấu trúc Exam.
 */
export class ExamBuilder implements IExamBuilder {
  private title = ''
  private description = ''
  private duration = 0
  private difficulty: Difficulty | 'mixed' = 'mixed'

  setTitle(title: string): this {
    this.title = title
    return this
  }

  setDescription(description: string): this {
    this.description = description
    return this
  }

  setDuration(minutes: number): this {
    this.duration = minutes
    return this
  }

  setDifficulty(difficulty: Difficulty | 'mixed'): this {
    this.difficulty = difficulty
    return this
  }

  build(): Exam {
    if (!this.title || this.title.trim() === '') {
      throw new Error('Tên đề thi không được để trống.')
    }

    if (this.duration <= 0) {
      throw new Error('Thời gian làm bài phải lớn hơn 0 phút.')
    }

    const exam: Exam = {
      id: uuidv4(),
      title: this.title.trim(),
      description: this.description.trim(),
      duration: this.duration,
      difficulty: this.difficulty,
      questionIds: [],
      createdAt: new Date().toISOString()
    }

    this.reset()
    return exam
  }

  reset(): this {
    this.title = ''
    this.description = ''
    this.duration = 0
    this.difficulty = 'mixed'
    return this
  }
}
