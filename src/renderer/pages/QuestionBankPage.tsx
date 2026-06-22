import React, { useEffect, useState, useMemo } from 'react'
import { Question, Difficulty } from '../../domain/entities/Question'
import DifficultyBadge from '../components/DifficultyBadge'
import FilterBar from '../components/FilterBar'
import QuestionFormModal from '../components/QuestionFormModal'

export default function QuestionBankPage(): React.ReactElement {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [editQuestion, setEditQuestion] = useState<Question | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadQuestions(): Promise<void> {
    setLoading(true)
    setError('')
    try {
      const list = await window.api.questionList()
      setAllQuestions(list)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadQuestions() }, [])

  // Lọc client-side: tức thì, không cần IPC mỗi lần gõ
  const questions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false
      if (filterTopic && !q.topic.toLowerCase().includes(filterTopic.toLowerCase())) return false
      return true
    })
  }, [allQuestions, filterDifficulty, filterTopic])

  function openCreate(): void {
    setEditQuestion(null)
    setShowModal(true)
  }

  function openEdit(q: Question): void {
    setEditQuestion(q)
    setShowModal(true)
  }

  async function handleSave(dto: object, id?: string): Promise<void> {
    try {
      if (id) {
        await window.api.questionUpdate(id, dto)
      } else {
        await window.api.questionCreate(dto as Parameters<typeof window.api.questionCreate>[0])
      }
      setShowModal(false)
      await loadQuestions()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Lỗi khi lưu')
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm('Xóa câu hỏi này?')) return
    try {
      await window.api.questionDelete(id)
      await loadQuestions()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Lỗi khi xóa')
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          Ngân hàng câu hỏi
          <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 10 }}>
            ({questions.length}/{allQuestions.length})
          </span>
        </h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm câu hỏi</button>
      </div>

      <FilterBar
        difficulty={filterDifficulty}
        topic={filterTopic}
        onDifficultyChange={setFilterDifficulty}
        onTopicChange={setFilterTopic}
      />
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state"><p>Đang tải...</p></div>
      ) : questions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="icon">📋</span>
            <p>
              {allQuestions.length === 0
                ? 'Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!'
                : 'Không có câu hỏi nào khớp với bộ lọc.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nội dung câu hỏi</th>
                <th>Chủ đề</th>
                <th>Độ khó</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td>{idx + 1}</td>
                  <td style={{ maxWidth: 380 }}>
                    <div style={{ fontWeight: 500 }}>{q.content}</div>
                    <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {q.options.map((opt) => (
                        <span
                          key={opt.id}
                          style={{
                            fontSize: 12,
                            color: opt.id === q.correctOptionId ? 'var(--success)' : 'var(--text-muted)'
                          }}
                        >
                          {opt.id === q.correctOptionId ? '✓ ' : '○ '}{opt.text}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{q.topic}</td>
                  <td>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(q)}>Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <QuestionFormModal
          editQuestion={editQuestion}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
