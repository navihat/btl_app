import { contextBridge, ipcRenderer } from 'electron'

async function invoke<T>(channel: string, ...args: any[]): Promise<T> {
  const res = await ipcRenderer.invoke(channel, ...args)
  if (res && typeof res === 'object' && 'success' in res) {
    if (!res.success) throw new Error(res.error || 'Unknown IPC error')
    return res.data as T
  }
  return res as T // fallback if handler not updated
}

contextBridge.exposeInMainWorld('api', {
  // Question
  questionCreate: (data: unknown) => invoke('question:create', data),
  questionUpdate: (id: string, data: unknown) => invoke('question:update', id, data),
  questionDelete: (id: string) => invoke('question:delete', id),
  questionList: (filters?: unknown) => invoke('question:list', filters),

  // Exam
  examCreate: (data: unknown) => invoke('exam:create', data),
  examAddQuestions: (examId: string, questionIds: string[]) =>
    invoke('exam:addQuestions', examId, questionIds),
  examDelete: (id: string) => invoke('exam:delete', id),
  examList: () => invoke('exam:list'),
  examGet: (id: string) => invoke('exam:get', id),

  // Application Control
  appQuit: () => ipcRenderer.send('app:quit')
})
