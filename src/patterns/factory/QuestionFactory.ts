import { v4 as uuidv4 } from 'uuid'
import { Question, QuestionOption, CreateQuestionDTO } from '../../domain/entities/Question'
import { IQuestionFactory } from './IQuestionFactory'

/**
 * Factory Method pattern – Concrete Factory (Person 2)
 *
 * Chịu trách nhiệm tạo Question hợp lệ:
 *   - Sinh uuid cho question và từng option
 *   - Validate đủ 4 options
 *   - Validate correctOptionIndex hợp lệ
 *
 * SRP: Class này chỉ có một nhiệm vụ duy nhất là khởi tạo Question.
 */
export class QuestionFactory implements IQuestionFactory {
  create(data: CreateQuestionDTO): Question {
    if (!data.content || data.content.trim() === '') {
      throw new Error('Nội dung câu hỏi không được để trống.')
    }

    if (!data.options || data.options.length !== 4) {
      throw new Error('Câu hỏi phải có đúng 4 đáp án.')
    }

    for (const opt of data.options) {
      if (!opt.text || opt.text.trim() === '') {
        throw new Error('Nội dung đáp án không được để trống.')
      }
    }

    if (
      data.correctOptionIndex < 0 ||
      data.correctOptionIndex >= data.options.length
    ) {
      throw new Error('Chỉ số đáp án đúng không hợp lệ.')
    }

    if (!data.topic || data.topic.trim() === '') {
      throw new Error('Chủ đề câu hỏi không được để trống.')
    }

    const options: QuestionOption[] = data.options.map((opt) => ({
      id: uuidv4(),
      text: opt.text.trim()
    }))

    return {
      id: uuidv4(),
      content: data.content.trim(),
      options,
      correctOptionId: options[data.correctOptionIndex].id,
      difficulty: data.difficulty,
      topic: data.topic.trim(),
      createdAt: new Date().toISOString()
    }
  }
}
