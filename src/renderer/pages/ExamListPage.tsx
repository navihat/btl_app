import React, { useEffect, useState } from 'react'
import { Exam } from '../../domain/entities/Exam'
import DifficultyBadge from '../components/DifficultyBadge'

interface Props {
  onCreateNew: () => void
  onViewDetail: (examId: string) => void
}

export default function ExamListPage({ onCreateNew, onViewDetail }: Props): React.ReactElement {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadExams(): Promise<void> {
    setLoading(true)
    setError('')
    try {
      const list = await window.api.examList()
      setExams(list)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadExams() }, [])

  async function handleDelete(id: string, title: string): Promise<void> {
    if (!confirm(`Xóa đề thi "${title}"?`)) return
    try {
      await window.api.examDelete(id)
      await loadExams()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Quản lý đề thi</h1>
        <button className="btn btn-primary" onClick={onCreateNew}>+ Tạo đề thi mới</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty-state"><p>Đang tải...</p></div>
      ) : exams.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="icon">📝</span>
            <p>Chưa có đề thi nào. Hãy tạo đề thi đầu tiên!</p>
            <button className="btn btn-primary" onClick={onCreateNew}>Tạo đề thi</button>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tên đề thi</th>
                <th>Mô tả</th>
                <th>Thời gian</th>
                <th>Mức độ</th>
                <th>Số câu</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, idx) => (
                <tr key={exam.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)', padding: 0 }}
                      onClick={() => onViewDetail(exam.id)}
                    >
                      {exam.title}
                    </button>
                  </td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: 200 }}>{exam.description || '—'}</td>
                  <td>{exam.duration} phút</td>
                  <td>
                    <DifficultyBadge difficulty={exam.difficulty} />
                  </td>
                  <td>{exam.questionIds.length} câu</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => onViewDetail(exam.id)}>Chi tiết</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam.id, exam.title)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
