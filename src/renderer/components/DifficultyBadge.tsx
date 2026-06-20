import React from 'react'

const LABELS: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
  mixed: 'Hỗn hợp'
}

interface Props {
  difficulty: string
}

export default function DifficultyBadge({ difficulty }: Props): React.ReactElement {
  return (
    <span className={`badge badge-${difficulty}`}>
      {LABELS[difficulty] ?? difficulty}
    </span>
  )
}
