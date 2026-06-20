import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Question
  questionCreate: (data: unknown) => ipcRenderer.invoke('question:create', data),
  questionUpdate: (id: string, data: unknown) => ipcRenderer.invoke('question:update', id, data),
  questionDelete: (id: string) => ipcRenderer.invoke('question:delete', id),
  questionList: (filters?: unknown) => ipcRenderer.invoke('question:list', filters),

  // Exam
  examCreate: (data: unknown) => ipcRenderer.invoke('exam:create', data),
  examAddQuestions: (examId: string, questionIds: string[]) =>
    ipcRenderer.invoke('exam:addQuestions', examId, questionIds),
  examDelete: (id: string) => ipcRenderer.invoke('exam:delete', id),
  examList: () => ipcRenderer.invoke('exam:list'),
  examGet: (id: string) => ipcRenderer.invoke('exam:get', id)
})
