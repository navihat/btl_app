import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { existsSync, mkdirSync, unlinkSync } from 'fs'

export class SqliteDatabase {
  private db: Database.Database

  constructor(private readonly dbPath: string) {
    this.ensureDirectory()
    this.db = new Database(this.dbPath)
    this.initializeSchema()
    this.removeOldJsonFiles()
  }

  private ensureDirectory(): void {
    const dir = dirname(this.dbPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  private initializeSchema(): void {
    // Kích hoạt khóa ngoại
    this.db.pragma('foreign_keys = ON')

    // Tạo các bảng nếu chưa tồn tại
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        correctOptionId TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        topic TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS question_options (
        id TEXT PRIMARY KEY,
        questionId TEXT NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (questionId) REFERENCES questions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exam_questions (
        examId TEXT NOT NULL,
        questionId TEXT NOT NULL,
        PRIMARY KEY (examId, questionId),
        FOREIGN KEY (examId) REFERENCES exams (id) ON DELETE CASCADE,
        FOREIGN KEY (questionId) REFERENCES questions (id) ON DELETE RESTRICT
      );
    `)
  }

  private removeOldJsonFiles(): void {
    const dir = dirname(this.dbPath)
    const oldFiles = [
      join(dir, 'questions.json'),
      join(dir, 'exams.json')
    ]

    for (const file of oldFiles) {
      if (existsSync(file)) {
        try {
          unlinkSync(file)
          console.log(`Deleted deprecated JSON file: ${file}`)
        } catch (error) {
          console.error(`Failed to delete deprecated JSON file ${file}:`, error)
        }
      }
    }
  }

  getDb(): Database.Database {
    return this.db
  }

  close(): void {
    this.db.close()
  }
}
