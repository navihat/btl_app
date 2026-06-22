import { ipcMain } from 'electron'
import { getExamService } from '../serviceFactory'
import { CreateExamDTO } from '../../domain/entities/Exam'

export function registerExamHandlers(): void {
  const service = getExamService()

  ipcMain.handle('exam:create', async (_event, data: CreateExamDTO) => {
    try {
      return { success: true, data: await service.createExam(data) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('exam:addQuestions', async (_event, examId: string, questionIds: string[]) => {
    try {
      return { success: true, data: await service.addQuestions(examId, questionIds) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('exam:delete', async (_event, id: string) => {
    try {
      await service.deleteExam(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('exam:list', async () => {
    try {
      return { success: true, data: await service.listExams() }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('exam:get', async (_event, id: string) => {
    try {
      return { success: true, data: await service.getExam(id) }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })
}
