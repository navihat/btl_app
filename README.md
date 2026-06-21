# Quiz Exam Generator

Ứng dụng desktop hỗ trợ giảng viên quản lý ngân hàng câu hỏi trắc nghiệm và tạo đề thi. Dự án được xây dựng bằng Electron, React và TypeScript, theo hướng Clean Architecture, có áp dụng các design pattern GoF và unit test bằng Vitest.

## Tính Năng

- Quản lý ngân hàng câu hỏi trắc nghiệm: thêm, sửa, xóa câu hỏi.
- Mỗi câu hỏi gồm nội dung, 4 đáp án, đáp án đúng, độ khó và chủ đề.
- Lọc câu hỏi theo độ khó và tìm kiếm theo chủ đề.
- Tạo đề thi với tên đề, mô tả, thời gian làm bài và mức độ.
- Chọn thủ công câu hỏi từ ngân hàng để đưa vào đề thi.
- Xem chi tiết đề thi và danh sách câu hỏi đã chọn.
- Xóa đề thi có xác nhận.
- Chặn xóa câu hỏi nếu câu hỏi đang được sử dụng trong một đề thi.

## Công Nghệ Sử Dụng

| Công nghệ               | Mục đích                                        |
| ----------------------- | ----------------------------------------------- |
| Electron                | Xây dựng ứng dụng desktop                       |
| React                   | Xây dựng giao diện người dùng                   |
| TypeScript              | Kiểm tra kiểu tĩnh và giảm lỗi runtime          |
| Vite / electron-vite    | Build và chạy môi trường phát triển             |
| Vitest                  | Unit test                                       |
| SQLite (better-sqlite3) | Cơ sở dữ liệu nhúng cục bộ                      |
| UUID                    | Sinh mã định danh cho câu hỏi, đáp án và đề thi |

## Kiến Trúc

Dự án được tách theo các lớp chính:

```text
Renderer UI
  -> Preload / IPC
  -> Domain Services
  -> Repository Interfaces
  -> SQLite Database
```

### Presentation Layer

Nằm trong `src/renderer`.

Gồm các màn hình React:

- `QuestionBankPage.tsx`: quản lý ngân hàng câu hỏi.
- `ExamListPage.tsx`: danh sách đề thi.
- `CreateExamPage.tsx`: tạo đề thi mới.
- `ExamDetailPage.tsx`: xem chi tiết đề thi và thêm câu hỏi.

### Preload Và IPC Layer

Nằm trong:

- `src/preload/index.ts`
- `src/main/ipc/questionHandlers.ts`
- `src/main/ipc/examHandlers.ts`

Renderer không gọi trực tiếp Node.js API. Thay vào đó, renderer gọi `window.api`, preload gửi request qua IPC đến main process.

### Domain Layer

Nằm trong `src/domain`.

Chứa:

- Entity và DTO: `Question.ts`, `Exam.ts`
- Repository interface: `IQuestionRepository.ts`, `IExamRepository.ts`
- Service nghiệp vụ: `QuestionService.ts`, `ExamService.ts`

### Database Layer

Nằm trong `src/database`.

Chứa cấu trúc và các repository đọc ghi cơ sở dữ liệu SQLite:

- `SqliteDatabase.ts` (Quản lý kết nối và schema database)
- `SqliteQuestionRepository.ts` (Thao tác bảng câu hỏi)
- `SqliteExamRepository.ts` (Thao tác bảng đề thi)

Cơ sở dữ liệu SQLite mặc định được tạo tại:

- `data/database.db`

## Design Patterns

Dự án áp dụng 4 design pattern chính.

### Factory Method

File:

- `src/patterns/factory/IQuestionFactory.ts`
- `src/patterns/factory/QuestionFactory.ts`

`QuestionFactory` chịu trách nhiệm tạo câu hỏi hợp lệ:

- Validate nội dung câu hỏi.
- Validate đúng 4 đáp án.
- Validate đáp án đúng.
- Validate chủ đề và độ khó.
- Sinh UUID cho câu hỏi và từng đáp án.

### Builder

File:

- `src/patterns/builder/IExamBuilder.ts`
- `src/patterns/builder/ExamBuilder.ts`

`ExamBuilder` xây dựng đối tượng đề thi theo từng bước:

```ts
builder
  .setTitle("Đề giữa kỳ")
  .setDescription("Đề thi chính thức")
  .setDuration(60)
  .setDifficulty("mixed")
  .build();
```

Builder validate title và duration trước khi tạo đề thi, sau đó reset state để tránh rò rỉ dữ liệu giữa các lần build.

### Strategy

File:

- `src/patterns/strategy/IQuestionSelectionStrategy.ts`
- `src/patterns/strategy/ManualSelectionStrategy.ts`

`ManualSelectionStrategy` thực hiện việc chọn câu hỏi theo danh sách ID. Cách thiết kế này giúp sau này có thể thêm các chiến lược khác như chọn ngẫu nhiên, chọn theo chủ đề hoặc chọn theo tỷ lệ độ khó mà không cần sửa `ExamService`.

### Observer

File:

- `src/patterns/observer/IExamObserver.ts`
- `src/patterns/observer/ExamSubject.ts`
- `src/patterns/observer/ExamListObserver.ts`

`ExamSubject` thông báo sự kiện khi đề thi được tạo hoặc xóa. Các observer có thể đăng ký để cập nhật cache, UI hoặc ghi log mà không làm `ExamService` phụ thuộc trực tiếp vào các thành phần đó.

## Cấu Trúc Thư Mục

```text
btl_app/
├── data/
│   └── database.db
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── database/
│   ├── main/
│   │   └── ipc/
│   ├── patterns/
│   │   ├── builder/
│   │   ├── factory/
│   │   ├── observer/
│   │   └── strategy/
│   ├── preload/
│   ├── renderer/
│   │   ├── components/
│   │   └── pages/
│   └── tests/
│       └── mocks/
├── electron.vite.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.web.json
└── vitest.config.ts
```

## Cài Đặt Và Chạy Ứng Dụng

Yêu cầu:

- Node.js 18 trở lên.
- npm 9 trở lên.

Cài đặt dependencies:

```bash
npm install
```

Chạy ứng dụng ở chế độ development:

```bash
npm run dev
```

Build bản production (biên dịch code):

```bash
npm run build
```

Đóng gói ứng dụng (Tạo bộ cài đặt/executable):

```bash
npm run dist
```

Kiểm tra TypeScript:

```bash
npm run typecheck
```

## Testing

Chạy tất cả unit test:

```bash
npm test
```

Chạy test kèm coverage:

```bash
npm run test:coverage
```

Hiện tại test suite có 52 test cases, bao phủ các phần:

- `QuestionFactory`
- `ExamBuilder`
- `ManualSelectionStrategy`
- `ExamSubject` và `ExamListObserver`
- `QuestionService`
- `ExamService`
- `SqliteQuestionRepository` và `SqliteExamRepository` (Tích hợp SQLite)

Coverage tập trung vào `src/domain/**` và `src/patterns/**`.

## Luồng Xử Lý Chính

### Tạo Câu Hỏi

```text
Renderer form
  -> window.api.questionCreate()
  -> IPC question:create
  -> QuestionService.createQuestion()
  -> QuestionFactory.create()
  -> SqliteQuestionRepository.save()
```

### Tạo Đề Thi

```text
Renderer form
  -> window.api.examCreate()
  -> IPC exam:create
  -> ExamService.createExam()
  -> ExamBuilder.build()
  -> SqliteExamRepository.save()
  -> ExamSubject.notify('created')
```

### Thêm Câu Hỏi Vào Đề Thi

```text
ExamDetailPage
  -> window.api.examAddQuestions()
  -> ExamService.addQuestions()
  -> ManualSelectionStrategy.select()
  -> SqliteExamRepository.update()
```

## Nguyên Tắc SOLID

- SRP: mỗi class có một trách nhiệm rõ ràng, ví dụ repository chỉ đọc ghi dữ liệu, factory chỉ tạo câu hỏi, service chỉ điều phối nghiệp vụ.
- OCP: có thể thêm strategy chọn câu hỏi mới mà không sửa `ExamService`.
- LSP: các implementation có thể thay thế interface tương ứng.
- ISP: các interface được tách nhỏ theo đúng mục đích.
- DIP: service phụ thuộc vào interface thay vì implementation cụ thể.

## Ghi Chú Dữ Liệu

Dữ liệu được lưu trong cơ sở dữ liệu SQLite nhúng. Khi chạy development, thư mục dữ liệu là `data/` tại root project và cơ sở dữ liệu được ghi vào file `database.db`. Khi đóng gói ứng dụng, đường dẫn dữ liệu được tính theo vị trí file thực thi.

## Phân Công Công Việc

| Thành viên | Phạm vi                                  |
| ---------- | ---------------------------------------- |
| Người 1    | UI / Renderer / Preload                  |
| Người 2    | Domain, Factory Method, Strategy         |
| Người 3    | Database, Builder, Electron main, config |
| Người 4    | Observer, unit tests, SOLID review       |

Chi tiết thuyết minh thiết kế và các sơ đồ được ghi trong báo cáo [Report_NhomAC30_QuizExamGenerator.md](file:///c:/Users/Hunt/Documents/js/Cu%E1%BB%91i%20k%C3%AC/btl_app/Report_NhomAC30_QuizExamGenerator.md).
