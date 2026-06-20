import React, { useState } from 'react'
import QuestionBankPage from './pages/QuestionBankPage'
import ExamListPage from './pages/ExamListPage'
import CreateExamPage from './pages/CreateExamPage'
import ExamDetailPage from './pages/ExamDetailPage'

export type Page =
  | { name: 'questions' }
  | { name: 'exams' }
  | { name: 'create-exam' }
  | { name: 'exam-detail'; examId: string }

const NAV_ITEMS = [
  { key: 'questions', label: 'Ngân hàng câu hỏi', icon: '📋' },
  { key: 'exams', label: 'Quản lý đề thi', icon: '📝' }
] as const

export default function App(): React.ReactElement {
  const [page, setPage] = useState<Page>({ name: 'questions' })

  function renderPage(): React.ReactElement {
    switch (page.name) {
      case 'questions':
        return <QuestionBankPage />
      case 'exams':
        return (
          <ExamListPage
            onCreateNew={() => setPage({ name: 'create-exam' })}
            onViewDetail={(id) => setPage({ name: 'exam-detail', examId: id })}
          />
        )
      case 'create-exam':
        return (
          <CreateExamPage
            onCreated={(id) => setPage({ name: 'exam-detail', examId: id })}
            onCancel={() => setPage({ name: 'exams' })}
          />
        )
      case 'exam-detail':
        return (
          <ExamDetailPage
            examId={page.examId}
            onBack={() => setPage({ name: 'exams' })}
          />
        )
    }
  }

  const activeKey = page.name === 'exam-detail' || page.name === 'create-exam' ? 'exams' : page.name

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Tạo Đề Trắc Nghiệm</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeKey === item.key ? 'active' : ''}`}
              onClick={() => setPage({ name: item.key } as Page)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">{renderPage()}</main>
    </div>
  )
}
