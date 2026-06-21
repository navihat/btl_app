import React, { useState } from 'react'
import QuestionBankPage from './pages/QuestionBankPage'
import ExamListPage from './pages/ExamListPage'
import CreateExamPage from './pages/CreateExamPage'
import ExamDetailPage from './pages/ExamDetailPage'
import InfoPage from './pages/InfoPage'

export type Page =
  | { name: 'questions' }
  | { name: 'exams' }
  | { name: 'create-exam' }
  | { name: 'exam-detail'; examId: string }
  | { name: 'info' }

const NAV_ITEMS = [
  { key: 'questions', label: 'Ngân hàng câu hỏi', icon: '📋' },
  { key: 'exams', label: 'Quản lý đề thi', icon: '📝' },
  { key: 'info', label: 'Thông tin nhóm', icon: 'ℹ️' }
] as const

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h2>Đã xảy ra lỗi hệ thống!</h2>
          <pre>{this.state.error?.message}</pre>
          <button onClick={() => window.location.reload()} className="btn btn-primary">Tải lại trang</button>
        </div>
      )
    }
    return this.props.children
  }
}

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
      case 'info':
        return <InfoPage />
    }
  }

  const activeKey = page.name === 'exam-detail' || page.name === 'create-exam' ? 'exams' : page.name

  return (
    <ErrorBoundary>
      <div className="layout">
        <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="sidebar-logo">Tạo Đề Trắc Nghiệm</div>
          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  className={`nav-item ${activeKey === item.key ? 'active' : ''}`}
                  onClick={() => {
                    setPage({ name: item.key } as Page)
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
            <button
              className="nav-item"
              style={{ color: 'var(--danger)', borderTop: '1px solid var(--border)', paddingTop: 14, paddingBottom: 14, marginTop: 'auto' }}
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn thoát ứng dụng?')) {
                  window.api.appQuit()
                }
              }}
            >
              <span>❌</span>
              Thoát ứng dụng
            </button>
          </nav>
        </aside>
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </ErrorBoundary>
  )
}
