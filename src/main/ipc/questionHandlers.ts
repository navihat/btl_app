import { ipcMain } from 'electron'
import { getQuestionService } from '../serviceFactory'
import { CreateQuestionDTO, UpdateQuestionDTO, QuestionFilter } from '../../domain/entities/Question'

export function registerQuestionHandlers(): void {
  const service = getQuestionService()

  ipcMain.handle('question:create', async (_event, data: CreateQuestionDTO) => {
    try {
      return { success: true, data: await service.createQuestion(data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('question:update', async (_event, id: string, data: UpdateQuestionDTO) => {
    try {
      return { success: true, data: await service.updateQuestion(id, data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('question:delete', async (_event, id: string) => {
    try {
      await service.deleteQuestion(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('question:list', async (_event, filters?: QuestionFilter) => {
    try {
      return { success: true, data: await service.listQuestions(filters) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })
}
