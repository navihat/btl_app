import { ipcMain } from 'electron'
import { getExamService } from '../serviceFactory'
import { CreateExamDTO } from '../../domain/entities/Exam'

export function registerExamHandlers(): void {
  const service = getExamService()

  ipcMain.handle('exam:create', async (_event, data: CreateExamDTO) => {
    return service.createExam(data)
  })

  ipcMain.handle('exam:addQuestions', async (_event, examId: string, questionIds: string[]) => {
    return service.addQuestions(examId, questionIds)
  })

  ipcMain.handle('exam:delete', async (_event, id: string) => {
    await service.deleteExam(id)
    return { success: true }
  })

  ipcMain.handle('exam:list', async () => {
    return service.listExams()
  })

  ipcMain.handle('exam:get', async (_event, id: string) => {
    return service.getExam(id)
  })
}
