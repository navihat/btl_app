import { ipcMain } from 'electron'
import { getQuestionService } from '../serviceFactory'
import { CreateQuestionDTO, UpdateQuestionDTO, QuestionFilter } from '../../domain/entities/Question'

export function registerQuestionHandlers(): void {
  const service = getQuestionService()

  ipcMain.handle('question:create', async (_event, data: CreateQuestionDTO) => {
    return service.createQuestion(data)
  })

  ipcMain.handle('question:update', async (_event, id: string, data: UpdateQuestionDTO) => {
    return service.updateQuestion(id, data)
  })

  ipcMain.handle('question:delete', async (_event, id: string) => {
    await service.deleteQuestion(id)
    return { success: true }
  })

  ipcMain.handle('question:list', async (_event, filters?: QuestionFilter) => {
    return service.listQuestions(filters)
  })
}
