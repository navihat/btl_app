import React, { useState } from 'react'
import { Difficulty } from '../../domain/entities/Question'
import { CreateExamDTO } from '../../domain/entities/Exam'

interface Props {
  onCreated: (examId: string) => void
  onCancel: () => void
}

interface FormData {
  title: string
  description: string
  duration: string
  difficulty: Difficulty | 'mixed'
}

export default function CreateExamPage({ onCreated, onCancel }: Props): React.ReactElement {
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    duration: '60',
    difficulty: 'mixed'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError('')

    const duration = parseInt(form.duration, 10)
    if (!form.title.trim()) { setError('Tên đề thi không được để trống.'); return }
    if (isNaN(duration) || duration <= 0) { setError('Thời gian làm bài phải lớn hơn 0.'); return }

    setLoading(true)
    try {
      const dto: CreateExamDTO = {
        title: form.title.trim(),
        description: form.description.trim(),
        duration,
        difficulty: form.difficulty
      }
      const exam = await window.api.examCreate(dto)
      onCreated(exam.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>← Quay lại</button>
          <h1 className="page-title">Tạo đề thi mới</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 580 }}>
        <form className="card-body" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Tên đề thi <span className="required">*</span></label>
            <input
              className="form-input"
              placeholder="Nhập tên đề thi..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả / Ghi chú</label>
            <textarea
              className="form-textarea"
              placeholder="Mô tả hoặc ghi chú cho đề thi..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Thời gian (phút) <span className="required">*</span></label>
              <input
                className="form-input"
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mức độ</label>
              <select
                className="form-select"
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty | 'mixed' }))}
              >
                <option value="mixed">Hỗn hợp</option>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo đề thi'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
