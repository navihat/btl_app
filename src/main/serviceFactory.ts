import { join, dirname } from 'path'
import { app } from 'electron'
import { JsonQuestionRepository } from '../infrastructure/JsonQuestionRepository'
import { JsonExamRepository } from '../infrastructure/JsonExamRepository'
import { QuestionFactory } from '../patterns/factory/QuestionFactory'
import { ExamBuilder } from '../patterns/builder/ExamBuilder'
import { ManualSelectionStrategy } from '../patterns/strategy/ManualSelectionStrategy'
import { ExamSubject } from '../patterns/observer/ExamSubject'
import { QuestionService } from '../domain/services/QuestionService'
import { ExamService } from '../domain/services/ExamService'

function getDataPath(): string {
  if (app.isPackaged) {
    return join(dirname(app.getPath('exe')), 'data')
  }
  return join(process.cwd(), 'data')
}

let questionServiceInstance: QuestionService | null = null
let examServiceInstance: ExamService | null = null

export function getQuestionService(): QuestionService {
  if (!questionServiceInstance) {
    const repo = new JsonQuestionRepository(join(getDataPath(), 'questions.json'))
    const factory = new QuestionFactory()
    questionServiceInstance = new QuestionService(repo, factory)
  }
  return questionServiceInstance
}

export function getExamService(): ExamService {
  if (!examServiceInstance) {
    const examRepo = new JsonExamRepository(join(getDataPath(), 'exams.json'))
    const questionRepo = new JsonQuestionRepository(join(getDataPath(), 'questions.json'))
    const builder = new ExamBuilder()
    const strategy = new ManualSelectionStrategy()
    const subject = new ExamSubject()
    examServiceInstance = new ExamService(examRepo, questionRepo, builder, strategy, subject)
  }
  return examServiceInstance
}
