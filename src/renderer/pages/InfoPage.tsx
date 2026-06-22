import React from 'react'

interface Member {
  name: string
  id: string
  role: string
  description: string
}

export default function InfoPage(): React.ReactElement {
  const members: Member[] = [
    {
      name: 'Lê Thanh Thảo',
      id: '20231631',
      role: 'UI / Renderer + Strategy Pattern',
      description: 'Phụ trách React Pages, Components, Electron Preload, ManualSelectionStrategy. Đảm bảo trải nghiệm người dùng và luồng chọn câu hỏi mượt mà.'
    },
    {
      name: 'Nguyễn Văn Mạnh',
      id: '20231609',
      role: 'Domain / Factory Method Pattern',
      description: 'Phụ trách định nghĩa Question/Exam entities, QuestionFactory, IQuestionFactory. Đảm bảo nghiệp vụ và các thực thể dữ liệu được khởi tạo hợp lệ.'
    },
    {
      name: 'Trương Văn Thái',
      id: '20231627',
      role: 'Infrastructure / Builder Pattern + Config',
      description: 'Phụ trách Sqlite database, Sqlite repositories, ExamBuilder, IExamBuilder, Electron Main process, IPC handlers và cấu hình build hệ thống.'
    },
    {
      name: 'Tống Nhật Huy',
      id: '20231595',
      role: 'Observer Pattern + Service layer + SOLID',
      description: 'Phụ trách lớp nghiệp vụ ExamService, QuestionService, serviceFactory, các lớp Observer (ExamSubject, ExamListObserver). Review SOLID và viết unit test mở rộng.'
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <h1 className="page-title">Thông tin ứng dụng (About)</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 style={{ fontSize: 18, marginBottom: 12, color: 'var(--primary)' }}>
            Học phần: AC3030 – Phát triển ứng dụng
          </h2>
          <p style={{ marginBottom: 6 }}>
            <strong>Đề tài:</strong> Ứng dụng tạo đề trắc nghiệm - Quiz Exam Generator
          </p>
          <p style={{ marginBottom: 6 }}>
            <strong>Học kỳ:</strong> 2025.2
          </p>
          <p style={{ marginBottom: 6 }}>
            <strong>Phiên bản:</strong> 1.0.0
          </p>
          <p style={{ marginBottom: 6 }}>
            <strong>Ngày phát hành:</strong> 23/06/2026
          </p>
          <p style={{ marginBottom: 6 }}>
            <strong>Cơ sở dữ liệu:</strong> SQLite (Nhúng cục bộ)
          </p>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: 10 }}>
        <h2 className="page-title" style={{ fontSize: 16 }}>Thành viên nhóm 6</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {members.map((member) => (
          <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{member.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                <strong>MSSV:</strong> {member.id}
              </p>
              <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, margin: 0 }}>
                {member.role}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4, flex: 1 }}>
                {member.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
