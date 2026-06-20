import React from 'react'
import { Question } from '../../domain/entities/Question'
import DifficultyBadge from './DifficultyBadge'

interface Props {
  question: Question
  index?: number
  selectable?: boolean
  selected?: boolean
  onToggle?: (id: string) => void
}

export default function QuestionCard({
  question: q,
  index,
  selectable = false,
  selected = false,
  onToggle
}: Props): React.ReactElement {
  const handleClick = (): void => {
    if (selectable && onToggle) onToggle(q.id)
  }

  return (
    <div
      className={`card${selectable ? ` question-chip${selected ? ' selected' : ''}` : ''}`}
      onClick={selectable ? handleClick : undefined}
      style={selectable ? { cursor: 'pointer' } : undefined}
    >
      <div
        className="card-body"
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
      >
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={handleClick}
            onClick={(e) => e.stopPropagation()}
            style={{ marginTop: 3, accentColor: 'var(--primary)', flexShrink: 0 }}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <span style={{ fontWeight: 500 }}>
              {index !== undefined && (
                <span className="question-num" style={{ marginRight: 8 }}>Câu {index + 1}</span>
              )}
              {q.content}
            </span>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <DifficultyBadge difficulty={q.difficulty} />
              <span className="badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                {q.topic}
              </span>
            </div>
          </div>

          <div className="options-list" style={{ paddingLeft: index !== undefined ? 46 : 0 }}>
            {q.options.map((opt) => (
              <div
                key={opt.id}
                className={`option-item${opt.id === q.correctOptionId ? ' correct' : ''}`}
              >
                {opt.id === q.correctOptionId ? '✓ ' : '○ '}{opt.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
