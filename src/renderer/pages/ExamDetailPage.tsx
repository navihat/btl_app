import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Exam } from '../../domain/entities/Exam'
import { Question } from '../../domain/entities/Question'
import DifficultyBadge from '../components/DifficultyBadge'
import FilterBar from '../components/FilterBar'
import QuestionCard from '../components/QuestionCard'

interface Props {
  examId: string
  onBack: () => void
}

export default function ExamDetailPage({ examId, onBack }: Props): React.ReactElement {
  const [exam, setExam] = useState<Exam | null>(null)
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [showBankModal, setShowBankModal] = useState(false)
  const [bank, setBank] = useState<Question[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bankFilterDifficulty, setBankFilterDifficulty] = useState('')
  const [bankFilterTopic, setBankFilterTopic] = useState('')
  const [addError, setAddError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadExam = useCallback(async () => {
    const e = await window.api.examGet(examId)
    setExam(e)
    if (e.questionIds.length > 0) {
      const all = await window.api.questionList()
      setExamQuestions(all.filter((q: Question) => e.questionIds.includes(q.id)))
    } else {
      setExamQuestions([])
    }
  }, [examId])

  useEffect(() => { loadExam() }, [loadExam])

  async function openBankModal(): Promise<void> {
    setAddError('')
    setSelectedIds(new Set())
    setBankFilterDifficulty('')
    setBankFilterTopic('')
    const all = await window.api.questionList()
    const existingIds = new Set(exam?.questionIds ?? [])
    setBank(all.filter((q: Question) => !existingIds.has(q.id)))
    setShowBankModal(true)
  }

  function toggleSelect(id: string): void {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAddQuestions(): Promise<void> {
    if (selectedIds.size === 0) { setAddError('Vui lòng chọn ít nhất 1 câu hỏi.'); return }
    setLoading(true)
    setAddError('')
    try {
      await window.api.examAddQuestions(examId, Array.from(selectedIds))
      setShowBankModal(false)
      await loadExam()
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : 'Đã xảy ra lỗi.')
    } finally {
      setLoading(false)
    }
  }

  // Lọc ngân hàng câu hỏi client-side
  const filteredBank = useMemo(() => bank.filter((q) => {
    if (bankFilterDifficulty && q.difficulty !== bankFilterDifficulty) return false
    if (bankFilterTopic && !q.topic.toLowerCase().includes(bankFilterTopic.toLowerCase())) return false
    return true
  }), [bank, bankFilterDifficulty, bankFilterTopic])

  if (!exam) return <div className="empty-state"><p>Đang tải...</p></div>

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Quay lại</button>
          <h1 className="page-title">{exam.title}</h1>
        </div>
        <button className="btn btn-primary" onClick={openBankModal}>+ Thêm câu hỏi</button>
      </div>

      <div className="card card-body">
        <div className="meta-row">
          <span>⏱ <strong>{exam.duration} phút</strong></span>
          <span>·</span>
          <DifficultyBadge difficulty={exam.difficulty} />
          <span>·</span>
          <span><strong>{exam.questionIds.length}</strong> câu hỏi</span>
          {exam.description && (
            <><span>·</span><span style={{ color: 'var(--text-muted)' }}>{exam.description}</span></>
          )}
        </div>
      </div>

      {examQuestions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="icon">📭</span>
            <p>Chưa có câu hỏi nào trong đề. Hãy thêm câu hỏi từ ngân hàng!</p>
            <button className="btn btn-primary" onClick={openBankModal}>Thêm câu hỏi</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {examQuestions.map((q, idx) => (
            <QuestionCard key={q.id} question={q} index={idx} />
          ))}
        </div>
      )}

      {showBankModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBankModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <span>Chọn câu hỏi từ ngân hàng</span>
              <button className="close-btn" onClick={() => setShowBankModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {addError && <div className="alert alert-error">{addError}</div>}

              <FilterBar
                difficulty={bankFilterDifficulty}
                topic={bankFilterTopic}
                onDifficultyChange={setBankFilterDifficulty}
                onTopicChange={setBankFilterTopic}
                extra={
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
                    Đã chọn: {selectedIds.size} / {filteredBank.length} câu
                  </span>
                }
              />

              {filteredBank.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <p>
                    {bank.length === 0
                      ? 'Ngân hàng chưa có câu hỏi nào hoặc tất cả đã được thêm vào đề.'
                      : 'Không có câu hỏi nào khớp với bộ lọc.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto', marginTop: 12 }}>
                  {filteredBank.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      selectable
                      selected={selectedIds.has(q.id)}
                      onToggle={toggleSelect}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBankModal(false)}>Hủy</button>
              <button
                className="btn btn-primary"
                onClick={handleAddQuestions}
                disabled={loading || selectedIds.size === 0}
              >
                {loading ? 'Đang thêm...' : `Thêm ${selectedIds.size} câu`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
