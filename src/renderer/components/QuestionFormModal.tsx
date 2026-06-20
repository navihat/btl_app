import React, { useState, useEffect } from 'react'
import { Question, Difficulty, CreateQuestionDTO, UpdateQuestionDTO } from '../../domain/entities/Question'

interface QuestionFormData {
  content: string
  optionTexts: [string, string, string, string]
  correctOptionIndex: number
  difficulty: Difficulty
  topic: string
}

const DEFAULT_FORM: QuestionFormData = {
  content: '',
  optionTexts: ['', '', '', ''],
  correctOptionIndex: 0,
  difficulty: Difficulty.Easy,
  topic: ''
}

interface Props {
  editQuestion: Question | null
  onSave: (dto: CreateQuestionDTO | UpdateQuestionDTO, id?: string) => Promise<void>
  onClose: () => void
}

export default function QuestionFormModal({ editQuestion, onSave, onClose }: Props): React.ReactElement {
  const [form, setForm] = useState<QuestionFormData>(DEFAULT_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editQuestion) {
      const optionTexts = editQuestion.options.map((o) => o.text) as [string, string, string, string]
      const correctIdx = editQuestion.options.findIndex((o) => o.id === editQuestion.correctOptionId)
      setForm({
        content: editQuestion.content,
        optionTexts,
        correctOptionIndex: correctIdx >= 0 ? correctIdx : 0,
        difficulty: editQuestion.difficulty,
        topic: editQuestion.topic
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    setError('')
  }, [editQuestion])

  function updateOptionText(index: number, value: string): void {
    const next = [...form.optionTexts] as [string, string, string, string]
    next[index] = value
    setForm((f) => ({ ...f, optionTexts: next }))
  }

  async function handleSubmit(): Promise<void> {
    setError('')
    setLoading(true)
    try {
      const dto = {
        content: form.content,
        options: form.optionTexts.map((t) => ({ text: t })),
        correctOptionIndex: form.correctOptionIndex,
        difficulty: form.difficulty,
        topic: form.topic
      }
      await onSave(dto, editQuestion?.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Đã xảy ra lỗi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span>{editQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">
              Nội dung câu hỏi <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Các đáp án <span className="required">*</span>
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              Chọn radio ở đầu hàng để đánh dấu đáp án đúng.
            </p>
            {([0, 1, 2, 3] as const).map((i) => (
              <div key={i} className="option-row">
                <input
                  type="radio"
                  name="correctOption"
                  checked={form.correctOptionIndex === i}
                  onChange={() => setForm((f) => ({ ...f, correctOptionIndex: i }))}
                />
                <input
                  className="form-input"
                  placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                  value={form.optionTexts[i]}
                  onChange={(e) => updateOptionText(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Độ khó <span className="required">*</span></label>
              <select
                className="form-select"
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Chủ đề <span className="required">*</span></label>
              <input
                className="form-input"
                placeholder="Nhập chủ đề..."
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}
