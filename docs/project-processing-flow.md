# Luồng xử lý tổng thể của dự án

Tài liệu này dùng để hiểu nhanh toàn bộ dự án `quiz-exam-generator`: dự án là ứng dụng Electron + React + TypeScript giúp giảng viên quản lý ngân hàng câu hỏi trắc nghiệm và tạo đề thi.

## 1. Bức tranh kiến trúc

Ứng dụng được chia thành 5 lớp chính:

```text
Renderer React UI
  -> window.api trong preload
  -> IPC handlers trong Electron main process
  -> Domain services
  -> Repository / Pattern implementations
  -> data/*.json
```

Ý nghĩa từng lớp:

- `src/renderer`: giao diện React, nơi người dùng thao tác.
- `src/preload`: expose `window.api` bằng `contextBridge`, làm cầu nối an toàn giữa renderer và main process.
- `src/main`: khởi tạo Electron window, đăng ký IPC handlers, wire dependencies.
- `src/domain`: entity, DTO, repository interfaces và service nghiệp vụ.
- `src/infrastructure`: repository đọc/ghi JSON file.
- `src/patterns`: Factory, Builder, Strategy, Observer.
- `data`: dữ liệu thật của app ở dev mode, gồm `questions.json` và `exams.json`.

## 2. Điểm vào khi chạy ứng dụng

Lệnh chạy:

```bash
npm run dev
```

Luồng khởi động:

```text
package.json
  -> electron-vite dev
  -> src/main/index.ts
  -> registerQuestionHandlers()
  -> registerExamHandlers()
  -> createWindow()
  -> preload: out/preload/index.js
  -> renderer: src/renderer/main.tsx
  -> App.tsx
```

Trong dev mode, `src/main/serviceFactory.ts` lấy dữ liệu từ:

```text
process.cwd()/data/questions.json
process.cwd()/data/exams.json
```

Khi packaged, dữ liệu được lấy từ thư mục `data` nằm cạnh file `.exe`.

## 3. Model dữ liệu

### Question

File: `src/domain/entities/Question.ts`

Một câu hỏi gồm:

- `id`: UUID của câu hỏi.
- `content`: nội dung câu hỏi.
- `options`: đúng 4 đáp án, mỗi đáp án có `id` và `text`.
- `correctOptionId`: id của đáp án đúng.
- `difficulty`: `easy`, `medium`, hoặc `hard`.
- `topic`: chủ đề.
- `createdAt`: ISO datetime.

Khi tạo mới, UI gửi `CreateQuestionDTO`:

```ts
{
  content: string
  options: { text: string }[]
  correctOptionIndex: number
  difficulty: Difficulty
  topic: string
}
```

Client không gửi `id`, `correctOptionId`, `createdAt`; các field này do `QuestionFactory` sinh ra.

### Exam

File: `src/domain/entities/Exam.ts`

Một đề thi gồm:

- `id`: UUID của đề.
- `title`: tên đề.
- `description`: mô tả.
- `duration`: thời gian làm bài, tính bằng phút.
- `difficulty`: `easy`, `medium`, `hard`, hoặc `mixed`.
- `questionIds`: danh sách id câu hỏi trong đề.
- `createdAt`: ISO datetime.

Đề thi chỉ lưu `questionIds`, không nhúng toàn bộ `Question`, để tránh trùng dữ liệu giữa `exams.json` và `questions.json`.

## 4. Luồng quản lý câu hỏi

### 4.1. Tải danh sách câu hỏi

```text
QuestionBankPage.tsx
  -> loadQuestions()
  -> window.api.questionList()
  -> preload ipcRenderer.invoke('question:list')
  -> questionHandlers.ts
  -> QuestionService.listQuestions()
  -> JsonQuestionRepository.findAll()
  -> data/questions.json
  -> trả Question[] về UI
```

`QuestionBankPage` hiện lọc client-side bằng `useMemo`, dựa trên:

- `filterDifficulty`
- `filterTopic`

Repository vẫn hỗ trợ filter qua `QuestionFilter`, nhưng màn hình hiện tại tải toàn bộ rồi lọc ở renderer.

### 4.2. Tạo câu hỏi

```text
QuestionFormModal.tsx
  -> người dùng nhập form và bấm Lưu
  -> QuestionBankPage.handleSave()
  -> window.api.questionCreate(dto)
  -> ipc 'question:create'
  -> QuestionService.createQuestion(dto)
  -> QuestionFactory.create(dto)
  -> JsonQuestionRepository.save(question)
  -> data/questions.json được ghi lại
  -> UI đóng modal và loadQuestions()
```

`QuestionFactory` chịu trách nhiệm:

- validate nội dung không rỗng.
- validate đúng 4 đáp án.
- validate từng đáp án không rỗng.
- validate `correctOptionIndex` hợp lệ.
- validate chủ đề không rỗng.
- sinh UUID cho câu hỏi và từng đáp án.
- map `correctOptionIndex` sang `correctOptionId`.

### 4.3. Cập nhật câu hỏi

```text
QuestionBankPage.openEdit(question)
  -> QuestionFormModal nhận editQuestion
  -> người dùng sửa và bấm Lưu
  -> window.api.questionUpdate(id, dto)
  -> ipc 'question:update'
  -> QuestionService.updateQuestion(id, dto)
  -> repo.findById(id)
  -> merge field mới vào Question cũ
  -> repo.update(updated)
  -> UI loadQuestions()
```

Khi update options, service giữ lại id option cũ theo index nếu có:

```ts
id: existing.options[i]?.id ?? `opt-${i}`
```

Điều này giúp `correctOptionId` có thể được cập nhật theo index mới.

### 4.4. Xóa câu hỏi

```text
QuestionBankPage.handleDelete(id)
  -> confirm()
  -> window.api.questionDelete(id)
  -> ipc 'question:delete'
  -> QuestionService.deleteQuestion(id)
  -> repo.findById(id)
  -> repo.delete(id)
  -> UI loadQuestions()
```

Lưu ý: hiện tại xóa câu hỏi không tự gỡ id câu hỏi khỏi các đề thi đang chứa câu hỏi đó. Nếu đề thi chứa id câu hỏi đã bị xóa, màn chi tiết đề sẽ không hiển thị được câu hỏi đó vì `ExamDetailPage` filter từ ngân hàng câu hỏi hiện có.

## 5. Luồng quản lý đề thi

### 5.1. Tải danh sách đề

```text
ExamListPage.tsx
  -> loadExams()
  -> window.api.examList()
  -> ipc 'exam:list'
  -> ExamService.listExams()
  -> JsonExamRepository.findAll()
  -> data/exams.json
  -> trả Exam[] về UI
```

`App.tsx` không dùng React Router; nó giữ state:

```ts
type Page =
  | { name: 'questions' }
  | { name: 'exams' }
  | { name: 'create-exam' }
  | { name: 'exam-detail'; examId: string }
```

### 5.2. Tạo đề thi

```text
ExamListPage
  -> onCreateNew()
  -> App setPage({ name: 'create-exam' })
  -> CreateExamPage
  -> người dùng nhập form và submit
  -> window.api.examCreate(dto)
  -> ipc 'exam:create'
  -> ExamService.createExam(dto)
  -> ExamBuilder.setTitle().setDescription().setDuration().setDifficulty().build()
  -> JsonExamRepository.save(exam)
  -> ExamSubject.notify('created', exam)
  -> App chuyển sang ExamDetailPage với exam.id
```

`ExamBuilder` chịu trách nhiệm:

- validate title không rỗng.
- validate duration lớn hơn 0.
- tạo `Exam` với `questionIds: []`.
- reset state nội bộ sau khi `build()`.

### 5.3. Xem chi tiết đề

```text
ExamDetailPage.tsx
  -> loadExam()
  -> window.api.examGet(examId)
  -> ipc 'exam:get'
  -> ExamService.getExam(examId)
  -> JsonExamRepository.findById(examId)
  -> nếu exam.questionIds có phần tử:
       window.api.questionList()
       filter Question[] theo exam.questionIds
  -> render QuestionCard[]
```

Điểm quan trọng: `Exam` chỉ có id câu hỏi, nên renderer phải tải danh sách câu hỏi rồi lọc để hiển thị chi tiết.

### 5.4. Thêm câu hỏi vào đề

```text
ExamDetailPage.openBankModal()
  -> window.api.questionList()
  -> lọc bỏ câu hỏi đã có trong đề
  -> người dùng tick nhiều câu hỏi
  -> handleAddQuestions()
  -> window.api.examAddQuestions(examId, selectedIds[])
  -> ipc 'exam:addQuestions'
  -> ExamService.addQuestions(examId, questionIds)
  -> examRepo.findById(examId)
  -> kiểm tra duplicate với exam.questionIds
  -> questionRepo.findAll()
  -> ManualSelectionStrategy.select(bank, { selectedIds })
  -> examRepo.update(updatedExam)
  -> UI đóng modal và loadExam()
```

`ManualSelectionStrategy` tạo `Map<id, Question>` từ ngân hàng câu hỏi để lookup nhanh, sau đó trả về danh sách câu hỏi đúng thứ tự `selectedIds`.

### 5.5. Xóa đề thi

```text
ExamListPage.handleDelete(id, title)
  -> confirm()
  -> window.api.examDelete(id)
  -> ipc 'exam:delete'
  -> ExamService.deleteExam(id)
  -> examRepo.findById(id)
  -> examRepo.delete(id)
  -> ExamSubject.notify('deleted', exam)
  -> UI loadExams()
```

## 6. Các design pattern đang dùng

### Factory Method

File chính:

- `src/patterns/factory/IQuestionFactory.ts`
- `src/patterns/factory/QuestionFactory.ts`

Mục đích: gom toàn bộ logic tạo `Question` hợp lệ vào một nơi.

### Builder

File chính:

- `src/patterns/builder/IExamBuilder.ts`
- `src/patterns/builder/ExamBuilder.ts`

Mục đích: tạo `Exam` bằng method chaining, validate trước khi trả object hoàn chỉnh.

### Strategy

File chính:

- `src/patterns/strategy/IQuestionSelectionStrategy.ts`
- `src/patterns/strategy/ManualSelectionStrategy.ts`

Mục đích: tách thuật toán chọn câu hỏi khỏi `ExamService`. Hiện chỉ có chọn thủ công, nhưng có thể thêm random hoặc chọn theo chủ đề.

### Observer

File chính:

- `src/patterns/observer/IExamObserver.ts`
- `src/patterns/observer/ExamSubject.ts`
- `src/patterns/observer/ExamListObserver.ts`

Mục đích: `ExamService` phát sự kiện khi tạo/xóa đề. Observer hiện chủ yếu được chứng minh bằng unit test; UI thực tế vẫn reload qua IPC.

## 7. Dependency wiring

File: `src/main/serviceFactory.ts`

`getQuestionService()` tạo singleton:

```text
JsonQuestionRepository(data/questions.json)
QuestionFactory
  -> QuestionService
```

`getExamService()` tạo singleton:

```text
JsonExamRepository(data/exams.json)
JsonQuestionRepository(data/questions.json)
ExamBuilder
ManualSelectionStrategy
ExamSubject
  -> ExamService
```

Đây là nơi duy nhất cần sửa nếu muốn đổi storage từ JSON sang SQLite hoặc đổi strategy chọn câu hỏi.

## 8. IPC contract

Renderer chỉ gọi các API này qua `window.api`:

```text
questionCreate(data)
questionUpdate(id, data)
questionDelete(id)
questionList(filters?)

examCreate(data)
examAddQuestions(examId, questionIds)
examDelete(id)
examList()
examGet(id)
```

Các channel IPC tương ứng:

```text
question:create
question:update
question:delete
question:list

exam:create
exam:addQuestions
exam:delete
exam:list
exam:get
```

Nếu thêm nghiệp vụ mới, thứ tự cập nhật thường là:

```text
1. Domain service / repository interface nếu cần
2. Infrastructure repository nếu cần lưu trữ
3. IPC handler trong src/main/ipc
4. API preload trong src/preload/index.ts
5. Type Window.api trong src/renderer/env.d.ts
6. Component/page React gọi API mới
7. Unit test cho domain/pattern
```

## 9. Thứ tự đọc code khuyến nghị

Để hiểu dự án nhanh, đọc theo thứ tự:

```text
1. package.json
2. src/main/index.ts
3. src/main/serviceFactory.ts
4. src/preload/index.ts
5. src/renderer/env.d.ts
6. src/renderer/App.tsx
7. src/domain/entities/Question.ts
8. src/domain/entities/Exam.ts
9. src/domain/services/QuestionService.ts
10. src/domain/services/ExamService.ts
11. src/infrastructure/JsonQuestionRepository.ts
12. src/infrastructure/JsonExamRepository.ts
13. src/patterns/**/*
14. src/renderer/pages/*.tsx
15. src/tests/*.test.ts
```

## 10. Cách chạy và kiểm chứng

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run test:coverage
```

Ý nghĩa:

- `npm run dev`: chạy Electron + Vite dev server.
- `npm test`: chạy unit tests bằng Vitest.
- `npm run typecheck`: kiểm tra TypeScript.
- `npm run build`: build production ra `out`.
- `npm run test:coverage`: tạo báo cáo coverage.

Coverage hiện được cấu hình chỉ tính:

```text
src/domain/**
src/patterns/**
```

Không tính renderer, main và infrastructure.

## 11. Rủi ro và điểm cần chú ý

- Nhiều chuỗi tiếng Việt trong source/docs đang bị mojibake, ví dụ `NgÃ¢n hÃ ng cÃ¢u há»i`. Nên chuẩn hóa encoding về UTF-8 nếu cần trình bày hoặc bảo trì lâu dài.
- Repository dùng `readFileSync`/`writeFileSync` trong main process. Với dữ liệu nhỏ thì ổn; với dữ liệu lớn hoặc thao tác dày đặc nên chuyển sang async I/O hoặc database.
- Xóa câu hỏi không cập nhật `questionIds` trong các đề thi đã chứa câu hỏi đó.
- Observer đã có pattern và test, nhưng UI hiện chưa subscribe trực tiếp; UI vẫn reload dữ liệu sau thao tác.
- `ExamService.addQuestions()` chưa gọi observer event sau khi thêm câu hỏi; hiện observer chỉ notify `created` và `deleted`.
- Renderer catch lỗi ở một số form, nhưng một số thao tác như list/delete chưa có UI error state rõ ràng.

## 12. Sơ đồ luồng chính

```text
Tạo câu hỏi:
UI form
  -> window.api.questionCreate
  -> IPC question:create
  -> QuestionService
  -> QuestionFactory
  -> JsonQuestionRepository
  -> data/questions.json

Tạo đề:
UI form
  -> window.api.examCreate
  -> IPC exam:create
  -> ExamService
  -> ExamBuilder
  -> JsonExamRepository
  -> data/exams.json
  -> ExamSubject.notify(created)

Thêm câu hỏi vào đề:
UI chọn câu hỏi
  -> window.api.examAddQuestions
  -> IPC exam:addQuestions
  -> ExamService
  -> ManualSelectionStrategy
  -> JsonExamRepository.update
  -> data/exams.json

Xem chi tiết đề:
UI detail
  -> window.api.examGet
  -> JsonExamRepository.findById
  -> window.api.questionList
  -> JsonQuestionRepository.findAll
  -> filter theo exam.questionIds
```
