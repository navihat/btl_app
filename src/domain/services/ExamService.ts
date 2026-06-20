import { Exam, CreateExamDTO } from '../entities/Exam'
import { IExamRepository } from '../repositories/IExamRepository'
import { IQuestionRepository } from '../repositories/IQuestionRepository'
import { IQuestionSelectionStrategy } from '../../patterns/strategy/IQuestionSelectionStrategy'
import { IExamBuilder } from '../../patterns/builder/IExamBuilder'
import { ExamSubject } from '../../patterns/observer/ExamSubject'

/**
 * SRP: Service này chỉ điều phối nghiệp vụ liên quan đến đề thi.
 *
 * DIP: Phụ thuộc vào các abstraction (interface), không phụ thuộc vào
 * implementation cụ thể của repository, builder, hay strategy.
 *
 * OCP: Thuật toán chọn câu hỏi được inject qua IQuestionSelectionStrategy,
 * có thể thêm strategy mới mà không sửa ExamService.
 */
export class ExamService {
  constructor(
    private readonly examRepo: IExamRepository,
    private readonly questionRepo: IQuestionRepository,
    private readonly examBuilder: IExamBuilder,
    private readonly selectionStrategy: IQuestionSelectionStrategy,
    private readonly examSubject: ExamSubject
  ) {}

  async createExam(data: CreateExamDTO): Promise<Exam> {
    const exam = this.examBuilder
      .setTitle(data.title)
      .setDescription(data.description ?? '')
      .setDuration(data.duration)
      .setDifficulty(data.difficulty)
      .build()

    await this.examRepo.save(exam)
    this.examSubject.notify('created', exam)
    return exam
  }

  async addQuestions(examId: string, questionIds: string[]): Promise<Exam> {
    const exam = await this.examRepo.findById(examId)
    if (!exam) {
      throw new Error(`Đề thi với id "${examId}" không tồn tại.`)
    }

    const duplicates = questionIds.filter((id) => exam.questionIds.includes(id))
    if (duplicates.length > 0) {
      throw new Error(`Câu hỏi đã tồn tại trong đề thi: ${duplicates.join(', ')}`)
    }

    const bank = await this.questionRepo.findAll()
    const selected = this.selectionStrategy.select(bank, { selectedIds: questionIds })

    const updated: Exam = {
      ...exam,
      questionIds: [...exam.questionIds, ...selected.map((q) => q.id)]
    }

    await this.examRepo.update(updated)
    return updated
  }

  async deleteExam(id: string): Promise<void> {
    const exam = await this.examRepo.findById(id)
    if (!exam) {
      throw new Error(`Đề thi với id "${id}" không tồn tại.`)
    }
    await this.examRepo.delete(id)
    this.examSubject.notify('deleted', exam)
  }

  async listExams(): Promise<Exam[]> {
    return this.examRepo.findAll()
  }

  async getExam(id: string): Promise<Exam> {
    const exam = await this.examRepo.findById(id)
    if (!exam) {
      throw new Error(`Đề thi với id "${id}" không tồn tại.`)
    }
    return exam
  }
}
