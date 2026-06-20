# Trực quan hóa luồng xử lý dự án

Tài liệu này dùng Mermaid để biểu diễn trực quan các luồng chính trong dự án. Có thể xem bằng VS Code Markdown Preview có hỗ trợ Mermaid, GitHub, hoặc các công cụ render Mermaid.

## 1. Kiến trúc tổng thể

```mermaid
flowchart LR
  User[Giảng viên] --> Renderer[Renderer React UI]
  Renderer --> Preload[Preload: window.api]
  Preload --> IPC[IPC handlers]
  IPC --> Services[Domain services]
  Services --> Patterns[Factory / Builder / Strategy / Observer]
  Services --> Repos[Repository interfaces]
  Repos --> Infra[JSON repositories]
  Infra --> Data[(data/questions.json<br/>data/exams.json)]

  subgraph RendererProcess[Electron Renderer Process]
    Renderer
  end

  subgraph Bridge[Secure Bridge]
    Preload
  end

  subgraph MainProcess[Electron Main Process]
    IPC
    Services
    Patterns
    Repos
    Infra
  end
```

## 2. Luồng khởi động ứng dụng

```mermaid
sequenceDiagram
  participant NPM as npm run dev
  participant EV as electron-vite
  participant Main as src/main/index.ts
  participant Factory as serviceFactory.ts
  participant IPC as IPC handlers
  participant Window as BrowserWindow
  participant Preload as preload/index.ts
  participant React as React App

  NPM->>EV: electron-vite dev
  EV->>Main: chạy main process
  Main->>IPC: registerQuestionHandlers()
  Main->>IPC: registerExamHandlers()
  IPC->>Factory: getQuestionService() / getExamService()
  Factory-->>IPC: service singleton
  Main->>Window: createWindow()
  Window->>Preload: load preload script
  Preload->>React: expose window.api
  Window->>React: load renderer
```

## 3. Luồng tạo câu hỏi

```mermaid
sequenceDiagram
  participant UI as QuestionFormModal
  participant Page as QuestionBankPage
  participant API as window.api
  participant Preload as ipcRenderer.invoke
  participant Handler as questionHandlers.ts
  participant Service as QuestionService
  participant Factory as QuestionFactory
  participant Repo as JsonQuestionRepository
  participant Data as questions.json

  UI->>Page: onSave(dto)
  Page->>API: questionCreate(dto)
  API->>Preload: invoke('question:create', dto)
  Preload->>Handler: question:create
  Handler->>Service: createQuestion(dto)
  Service->>Factory: create(dto)
  Factory-->>Service: Question hợp lệ
  Service->>Repo: save(question)
  Repo->>Data: read + push + write
  Data-->>Repo: saved
  Repo-->>Service: void
  Service-->>Handler: Question
  Handler-->>Page: Question
  Page->>Page: đóng modal, loadQuestions()
```

## 4. Logic validate khi tạo câu hỏi

```mermaid
flowchart TD
  Start[Bắt đầu tạo Question] --> Content{content rỗng?}
  Content -- Có --> ErrContent[Throw lỗi nội dung rỗng]
  Content -- Không --> OptCount{options.length == 4?}
  OptCount -- Không --> ErrOptCount[Throw lỗi phải có đúng 4 đáp án]
  OptCount -- Có --> OptText{mọi option.text hợp lệ?}
  OptText -- Không --> ErrOptText[Throw lỗi đáp án rỗng]
  OptText -- Có --> Correct{correctOptionIndex hợp lệ?}
  Correct -- Không --> ErrCorrect[Throw lỗi index đáp án đúng]
  Correct -- Có --> Topic{topic rỗng?}
  Topic -- Có --> ErrTopic[Throw lỗi chủ đề rỗng]
  Topic -- Không --> UUID[Sinh UUID cho question và options]
  UUID --> MapCorrect[Map correctOptionIndex sang correctOptionId]
  MapCorrect --> Return[Trả về Question]
```

## 5. Luồng cập nhật câu hỏi

```mermaid
sequenceDiagram
  participant Page as QuestionBankPage
  participant API as window.api
  participant Handler as questionHandlers.ts
  participant Service as QuestionService
  participant Repo as JsonQuestionRepository
  participant Data as questions.json

  Page->>API: questionUpdate(id, dto)
  API->>Handler: ipc question:update
  Handler->>Service: updateQuestion(id, dto)
  Service->>Repo: findById(id)
  Repo->>Data: read
  Data-->>Repo: questions[]
  Repo-->>Service: existing question hoặc null
  alt không tồn tại
    Service-->>Handler: throw Error
    Handler-->>Page: reject Promise
  else tồn tại
    Service->>Service: merge field được gửi trong dto
    Service->>Repo: update(updated)
    Repo->>Data: write
    Service-->>Handler: updated Question
    Handler-->>Page: updated Question
  end
```

## 6. Luồng tạo đề thi

```mermaid
sequenceDiagram
  participant UI as CreateExamPage
  participant API as window.api
  participant Handler as examHandlers.ts
  participant Service as ExamService
  participant Builder as ExamBuilder
  participant Repo as JsonExamRepository
  participant Subject as ExamSubject
  participant Data as exams.json
  participant App as App.tsx

  UI->>UI: validate title và duration
  UI->>API: examCreate(dto)
  API->>Handler: ipc exam:create
  Handler->>Service: createExam(dto)
  Service->>Builder: setTitle().setDescription().setDuration().setDifficulty().build()
  Builder-->>Service: Exam với questionIds = []
  Service->>Repo: save(exam)
  Repo->>Data: read + push + write
  Service->>Subject: notify('created', exam)
  Service-->>Handler: Exam
  Handler-->>UI: Exam
  UI->>App: onCreated(exam.id)
  App->>App: setPage({ name: 'exam-detail', examId })
```

## 7. Logic validate khi tạo đề

```mermaid
flowchart TD
  Start[Bắt đầu tạo Exam] --> Title{title rỗng?}
  Title -- Có --> ErrTitle[Throw lỗi tên đề thi rỗng]
  Title -- Không --> Duration{duration > 0?}
  Duration -- Không --> ErrDuration[Throw lỗi thời gian không hợp lệ]
  Duration -- Có --> Create[Tạo Exam]
  Create --> EmptyQuestions[questionIds = []]
  EmptyQuestions --> Reset[Reset state của Builder]
  Reset --> Return[Trả về Exam]
```

## 8. Luồng thêm câu hỏi vào đề thi

```mermaid
sequenceDiagram
  participant UI as ExamDetailPage
  participant API as window.api
  participant Handler as examHandlers.ts
  participant Service as ExamService
  participant ExamRepo as JsonExamRepository
  participant QuestionRepo as JsonQuestionRepository
  participant Strategy as ManualSelectionStrategy
  participant Data as exams.json

  UI->>API: questionList()
  API-->>UI: toàn bộ câu hỏi
  UI->>UI: lọc bỏ câu đã có trong exam.questionIds
  UI->>UI: người dùng chọn selectedIds
  UI->>API: examAddQuestions(examId, selectedIds)
  API->>Handler: ipc exam:addQuestions
  Handler->>Service: addQuestions(examId, selectedIds)
  Service->>ExamRepo: findById(examId)
  ExamRepo-->>Service: Exam hoặc null
  alt đề không tồn tại
    Service-->>Handler: throw Error
  else đề tồn tại
    Service->>Service: kiểm tra duplicate trong exam.questionIds
    alt có duplicate
      Service-->>Handler: throw Error
    else không duplicate
      Service->>QuestionRepo: findAll()
      QuestionRepo-->>Service: bank Question[]
      Service->>Strategy: select(bank, { selectedIds })
      Strategy-->>Service: selected Question[]
      Service->>ExamRepo: update(exam với questionIds mới)
      ExamRepo->>Data: write
      Service-->>Handler: updated Exam
      Handler-->>UI: updated Exam
      UI->>UI: đóng modal, loadExam()
    end
  end
```

## 9. Decision flow khi thêm câu hỏi vào đề

```mermaid
flowchart TD
  Start[Bắt đầu addQuestions] --> ExamExists{Exam tồn tại?}
  ExamExists -- Không --> ErrExam[Throw lỗi đề không tồn tại]
  ExamExists -- Có --> Duplicate{Có questionId đã nằm trong đề?}
  Duplicate -- Có --> ErrDuplicate[Throw lỗi câu hỏi đã tồn tại trong đề]
  Duplicate -- Không --> LoadBank[Lấy toàn bộ ngân hàng câu hỏi]
  LoadBank --> Select[ManualSelectionStrategy.select]
  Select --> AllFound{Mọi selectedId đều tồn tại trong bank?}
  AllFound -- Không --> ErrMissing[Throw lỗi câu hỏi không tồn tại trong ngân hàng]
  AllFound -- Có --> Merge[Gộp questionIds cũ và mới]
  Merge --> Save[Cập nhật exams.json]
  Save --> Return[Trả về Exam mới]
```

## 10. Luồng xem chi tiết đề thi

```mermaid
sequenceDiagram
  participant UI as ExamDetailPage
  participant API as window.api
  participant ExamService as ExamService
  participant ExamRepo as JsonExamRepository
  participant QuestionService as QuestionService
  participant QuestionRepo as JsonQuestionRepository

  UI->>API: examGet(examId)
  API->>ExamService: getExam(examId)
  ExamService->>ExamRepo: findById(examId)
  ExamRepo-->>ExamService: Exam
  ExamService-->>UI: Exam
  alt exam.questionIds rỗng
    UI->>UI: setExamQuestions([])
  else có questionIds
    UI->>API: questionList()
    API->>QuestionService: listQuestions()
    QuestionService->>QuestionRepo: findAll()
    QuestionRepo-->>QuestionService: Question[]
    QuestionService-->>UI: Question[]
    UI->>UI: filter q.id nằm trong exam.questionIds
  end
```

## 11. Luồng xóa dữ liệu

```mermaid
flowchart LR
  subgraph DeleteQuestion[Xóa câu hỏi]
    Q1[QuestionBankPage] --> Q2[window.api.questionDelete]
    Q2 --> Q3[question:delete]
    Q3 --> Q4[QuestionService.deleteQuestion]
    Q4 --> Q5[JsonQuestionRepository.delete]
    Q5 --> Q6[(questions.json)]
  end

  subgraph DeleteExam[Xóa đề thi]
    E1[ExamListPage] --> E2[window.api.examDelete]
    E2 --> E3[exam:delete]
    E3 --> E4[ExamService.deleteExam]
    E4 --> E5[JsonExamRepository.delete]
    E5 --> E6[(exams.json)]
    E4 --> E7[ExamSubject.notify deleted]
  end
```

Lưu ý: xóa câu hỏi không tự xóa id câu hỏi đó khỏi `questionIds` trong các đề thi.

## 12. Sơ đồ tầng file

```mermaid
flowchart TB
  subgraph UI[Renderer UI]
    App[src/renderer/App.tsx]
    Pages[src/renderer/pages/*.tsx]
    Components[src/renderer/components/*.tsx]
    Styles[src/renderer/styles.css]
  end

  subgraph Bridge[Preload Bridge]
    Preload[src/preload/index.ts]
    Env[src/renderer/env.d.ts]
  end

  subgraph Main[Main Process]
    MainIndex[src/main/index.ts]
    Factory[src/main/serviceFactory.ts]
    QHandlers[src/main/ipc/questionHandlers.ts]
    EHandlers[src/main/ipc/examHandlers.ts]
  end

  subgraph Domain[Domain]
    Entities[src/domain/entities/*.ts]
    RepoInterfaces[src/domain/repositories/*.ts]
    Services[src/domain/services/*.ts]
  end

  subgraph Patterns[Patterns]
    PFactory[src/patterns/factory/*.ts]
    PBuilder[src/patterns/builder/*.ts]
    PStrategy[src/patterns/strategy/*.ts]
    PObserver[src/patterns/observer/*.ts]
  end

  subgraph Infrastructure[Infrastructure]
    JsonRepos[src/infrastructure/*.ts]
    JsonData[(data/*.json)]
  end

  UI --> Bridge
  Bridge --> Main
  Main --> Domain
  Domain --> Patterns
  Domain --> Infrastructure
  Infrastructure --> JsonData
```

## 13. Class dependency map

```mermaid
classDiagram
  class QuestionService {
    +createQuestion(dto)
    +updateQuestion(id, dto)
    +deleteQuestion(id)
    +listQuestions(filter)
    +getQuestion(id)
  }

  class ExamService {
    +createExam(dto)
    +addQuestions(examId, questionIds)
    +deleteExam(id)
    +listExams()
    +getExam(id)
  }

  class IQuestionRepository
  class IExamRepository
  class IQuestionFactory
  class IExamBuilder
  class IQuestionSelectionStrategy
  class ExamSubject

  class JsonQuestionRepository
  class JsonExamRepository
  class QuestionFactory
  class ExamBuilder
  class ManualSelectionStrategy

  QuestionService --> IQuestionRepository
  QuestionService --> IQuestionFactory
  ExamService --> IExamRepository
  ExamService --> IQuestionRepository
  ExamService --> IExamBuilder
  ExamService --> IQuestionSelectionStrategy
  ExamService --> ExamSubject

  JsonQuestionRepository ..|> IQuestionRepository
  JsonExamRepository ..|> IExamRepository
  QuestionFactory ..|> IQuestionFactory
  ExamBuilder ..|> IExamBuilder
  ManualSelectionStrategy ..|> IQuestionSelectionStrategy
```

## 14. Vòng đời dữ liệu trong JSON repository

```mermaid
flowchart TD
  Method[Repository method được gọi] --> Ensure{File tồn tại?}
  Ensure -- Không --> CreateFile[Tạo thư mục và file JSON rỗng]
  Ensure -- Có --> Read[readFileSync]
  CreateFile --> Read
  Read --> Parse[JSON.parse]
  Parse --> Operation{Loại thao tác}
  Operation -- findAll/findById --> Return[Trả dữ liệu]
  Operation -- save --> Push[Push item mới]
  Operation -- update --> Replace[Find index và replace]
  Operation -- delete --> Filter[Filter bỏ item]
  Push --> Write[writeFileSync]
  Replace --> Write
  Filter --> Write
  Write --> Done[Hoàn tất]
```

## 15. Checklist khi thêm một nghiệp vụ mới

```mermaid
flowchart TD
  Start[Thêm nghiệp vụ mới] --> NeedDomain{Có logic nghiệp vụ mới?}
  NeedDomain -- Có --> Service[Sửa hoặc thêm Domain Service]
  NeedDomain -- Không --> Handler
  Service --> NeedRepo{Cần lưu/truy vấn dữ liệu mới?}
  NeedRepo -- Có --> RepoInterface[Cập nhật repository interface]
  RepoInterface --> Infra[Cập nhật infrastructure repository]
  NeedRepo -- Không --> Handler[Thêm IPC handler]
  Infra --> Handler
  Handler --> Preload[Cập nhật preload window.api]
  Preload --> Env[Cập nhật env.d.ts]
  Env --> UI[Cập nhật React page/component]
  UI --> Tests[Thêm unit tests]
  Tests --> Verify[npm test + npm run typecheck]
```
