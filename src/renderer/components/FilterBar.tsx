import React from 'react'

interface Props {
  difficulty: string
  topic: string
  onDifficultyChange: (value: string) => void
  onTopicChange: (value: string) => void
  extra?: React.ReactNode
}

export default function FilterBar({
  difficulty,
  topic,
  onDifficultyChange,
  onTopicChange,
  extra
}: Props): React.ReactElement {
  return (
    <div className="filter-bar card card-body">
      <select value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)}>
        <option value="">Tất cả độ khó</option>
        <option value="easy">Dễ</option>
        <option value="medium">Trung bình</option>
        <option value="hard">Khó</option>
      </select>
      <input
        placeholder="Tìm theo chủ đề..."
        value={topic}
        onChange={(e) => onTopicChange(e.target.value)}
        style={{ minWidth: 200 }}
      />
      {extra}
    </div>
  )
}
