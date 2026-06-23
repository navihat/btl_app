import { join, dirname } from 'path'
import { app } from 'electron'
import { SqliteDatabase } from '../infrastructure/SqliteDatabase'
import { SqliteQuestionRepository } from '../infrastructure/SqliteQuestionRepository'
import { SqliteExamRepository } from '../infrastructure/SqliteExamRepository'
import { QuestionFactory } from '../patterns/factory/QuestionFactory'
import { ExamBuilder } from '../patterns/builder/ExamBuilder'
import { ManualSelectionStrategy } from '../patterns/strategy/ManualSelectionStrategy'
import { ExamSubject } from '../patterns/observer/ExamSubject'
import { ExamListObserver } from '../patterns/observer/ExamListObserver'
import { QuestionService } from '../domain/services/QuestionService'
import { ExamService } from '../domain/services/ExamService'

function getDataPath(): string {
  if (app.isPackaged) {
    return join(app.getPath('userData'), 'data')
  }
  return join(process.cwd(), 'data')
}

let dbInstance: SqliteDatabase | null = null
let questionServiceInstance: QuestionService | null = null
let examServiceInstance: ExamService | null = null
let sharedQuestionRepo: SqliteQuestionRepository | null = null
let sharedExamRepo: SqliteExamRepository | null = null

function getDatabase(): SqliteDatabase {
  if (!dbInstance) {
    dbInstance = new SqliteDatabase(join(getDataPath(), 'database.db'))
  }
  return dbInstance
}

function getSharedQuestionRepo(): SqliteQuestionRepository {
  if (!sharedQuestionRepo) {
    sharedQuestionRepo = new SqliteQuestionRepository(getDatabase().getDb())
  }
  return sharedQuestionRepo
}

function getSharedExamRepo(): SqliteExamRepository {
  if (!sharedExamRepo) {
    sharedExamRepo = new SqliteExamRepository(getDatabase().getDb())
  }
  return sharedExamRepo
}

export function getQuestionService(): QuestionService {
  if (!questionServiceInstance) {
    const questionRepo = getSharedQuestionRepo()
    const examRepo = getSharedExamRepo()
    const factory = new QuestionFactory()
    questionServiceInstance = new QuestionService(questionRepo, factory, examRepo)
  }
  return questionServiceInstance
}

export function getExamService(): ExamService {
  if (!examServiceInstance) {
    const examRepo = getSharedExamRepo()
    const questionRepo = getSharedQuestionRepo()
    const builder = new ExamBuilder()
    const strategy = new ManualSelectionStrategy()
    const subject = new ExamSubject()
    
    // Initialize observer with existing exams
    const observer = new ExamListObserver()
    examRepo.findAll().then(exams => observer.setExams(exams)).catch(console.error)
    subject.subscribe(observer)

    examServiceInstance = new ExamService(examRepo, questionRepo, builder, strategy, subject)
  }
  return examServiceInstance
}
