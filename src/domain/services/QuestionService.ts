import { Question, CreateQuestionDTO, UpdateQuestionDTO, QuestionFilter } from '../entities/Question'
import { IQuestionRepository } from '../repositories/IQuestionRepository'
import { IQuestionFactory } from '../../patterns/factory/IQuestionFactory'

/**
 * SRP: Service này chỉ chịu trách nhiệm điều phối nghiệp vụ liên quan
 * đến câu hỏi. Không xử lý file I/O (do repository đảm nhận).
 *
 * DIP: Phụ thuộc vào IQuestionRepository và IQuestionFactory (abstractions),
 * không phụ thuộc vào JsonQuestionRepository hay QuestionFactory cụ thể.
 */
export class QuestionService {
  constructor(
    private readonly questionRepo: IQuestionRepository,
    private readonly questionFactory: IQuestionFactory
  ) {}

  async createQuestion(data: CreateQuestionDTO): Promise<Question> {
    const question = this.questionFactory.create(data)
    await this.questionRepo.save(question)
    return question
  }

  async updateQuestion(id: string, data: UpdateQuestionDTO): Promise<Question> {
    const existing = await this.questionRepo.findById(id)
    if (!existing) {
      throw new Error(`Câu hỏi với id "${id}" không tồn tại.`)
    }

    const updated: Question = { ...existing }

    if (data.content !== undefined) {
      if (data.content.trim() === '') throw new Error('Nội dung câu hỏi không được để trống.')
      updated.content = data.content.trim()
    }

    if (data.options !== undefined) {
      if (data.options.length !== 4) throw new Error('Câu hỏi phải có đúng 4 đáp án.')
      updated.options = data.options.map((opt, i) => ({
        id: existing.options[i]?.id ?? `opt-${i}`,
        text: opt.text.trim()
      }))
    }

    if (data.correctOptionIndex !== undefined) {
      const opts = updated.options
      if (data.correctOptionIndex < 0 || data.correctOptionIndex >= opts.length) {
        throw new Error('Chỉ số đáp án đúng không hợp lệ.')
      }
      updated.correctOptionId = opts[data.correctOptionIndex].id
    }

    if (data.difficulty !== undefined) updated.difficulty = data.difficulty
    if (data.topic !== undefined) {
      if (data.topic.trim() === '') throw new Error('Chủ đề câu hỏi không được để trống.')
      updated.topic = data.topic.trim()
    }

    await this.questionRepo.update(updated)
    return updated
  }

  async deleteQuestion(id: string): Promise<void> {
    const existing = await this.questionRepo.findById(id)
    if (!existing) {
      throw new Error(`Câu hỏi với id "${id}" không tồn tại.`)
    }
    await this.questionRepo.delete(id)
  }

  async listQuestions(filter?: QuestionFilter): Promise<Question[]> {
    return this.questionRepo.findAll(filter)
  }

  async getQuestion(id: string): Promise<Question> {
    const question = await this.questionRepo.findById(id)
    if (!question) {
      throw new Error(`Câu hỏi với id "${id}" không tồn tại.`)
    }
    return question
  }
}
