# TenderGO

Ung dung hoc tap va on thi da nen tang cho chuong trinh boi duong on thi chung chi nghiep vu chuyen mon ve dau thau.

## 1. Tong quan

TenderGO duoc xay dung theo huong:

- E-learning mini platform
- Test preparation app
- Offline-first MVP
- Admin-ready data model
- Co the mo rong len backend/API thuc trong cac giai doan tiep theo

Phien ban hien tai tap trung vao:

- Hoc theo tung chuyen de
- Doc bai hoc ly thuyet co cau truc
- Luyen ngan hang cau hoi
- Thi thu theo chuyen de
- Thi thu tong hop
- Luu lich su lam bai, bookmark, tien do hoc
- Phan tich diem manh, diem yeu
- Import/export snapshot JSON

Du lieu hien tai la du lieu mau minh hoa. Can duoc hoi dong chuyen mon ra soat truoc khi dua vao su dung chinh thuc.

## 2. Actor va use case

### Nguoi hoc

- Xem onboarding va vao app bang Guest mode hoac mock login
- Xem dashboard tong quan
- Hoc theo danh sach chuyen de
- Mo bai hoc va danh dau da hoc
- Tim kiem bai hoc, cau hoi, chuyen de
- Loc ngan hang cau hoi theo chuyen de, do kho, trang thai
- Tao de thi thu va lam bai voi dong ho dem nguoc
- Xem ket qua, review dap an, thong ke theo chuyen de
- Bookmark bai hoc va cau hoi
- Import/export du lieu hoc tap cuc bo

### Quan tri noi dung trong tuong lai

- Quan ly chuyen de, bai hoc, cau hoi, de thi
- Import JSON/Excel
- Dong bo nguoi hoc va thong ke len cloud

## 3. Cong nghe

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- Zustand + AsyncStorage persist
- TanStack React Query
- Zod + React Hook Form
- Expo FileSystem / Sharing / DocumentPicker
- Expo Linear Gradient

## 4. Kien truc

Ung dung duoc tach thanh 4 lop chinh:

1. Presentation
   - `src/components`
   - `src/features`
   - `src/navigation`

2. State va app session
   - `src/store`

3. Business logic / service layer
   - `src/services`
   - `src/utils`

4. Data source
   - `src/mock`
   - `src/services/repositories`

### Dinh huong clean architecture practical

- UI khong truy cap truc tiep seed raw neu co the tranh duoc
- View model duoc tinh qua service layer
- Repository dong vai tro data access abstraction
- Persist local tach rieng khoi catalog seed

## 5. Cau truc thu muc

```text
.
|-- App.tsx
|-- app.json
|-- babel.config.js
|-- package.json
|-- README.md
`-- src
    |-- bootstrap
    |   |-- AppLoadingScreen.tsx
    |   |-- AppProviders.tsx
    |   `-- AppRoot.tsx
    |-- components
    |-- constants
    |-- features
    |   |-- analytics
    |   |-- bookmarks
    |   |-- exams
    |   |-- home
    |   |-- import-export
    |   |-- onboarding
    |   |-- profile
    |   |-- questions
    |   |-- search
    |   `-- topics
    |-- hooks
    |-- mock
    |   |-- seed.ts
    |   `-- topics
    |-- navigation
    |-- services
    |   |-- repositories
    |   |-- dataTransferService.ts
    |   |-- examService.ts
    |   |-- homeService.ts
    |   |-- questionBankService.ts
    |   `-- topicService.ts
    |-- store
    |-- theme
    |-- types
    `-- utils
```

## 6. Data model

### Program

- `id`
- `code`
- `name`
- `description`
- `disclaimer`

### Topic

- `id`
- `code`
- `name`
- `shortDescription`
- `learningObjectives`
- `lessonIds`
- `summary`
- `flashSummary`
- `tags`
- `order`
- `estimatedStudyTime`

### Lesson

- `id`
- `topicId`
- `title`
- `content`
- `keyPoints`
- `quickNotes`
- `example`
- `references`
- `estimatedStudyTime`

### Question

- `id`
- `topicId`
- `lessonId`
- `question`
- `options`
- `correctAnswer`
- `explanation`
- `difficulty`
- `tags`
- `source`

### ExamDefinition

- `id`
- `title`
- `mode`
- `topicIds`
- `numberOfQuestions`
- `durationMinutes`
- `questionSelectionStrategy`
- `passingScore`
- `description`

### Persisted learner state

- `profile`
- `preferences`
- `bookmarks`
- `lessonProgress`
- `questionPerformance`
- `history`
- `reviewMap`
- `activeSession`

## 7. Du lieu seed hien co

Phien ban hien tai da seed san:

- 9 chuyen de: `1, 2, 3, 4, 5, 6, 7, 8, 10`
- 27 bai hoc
- 162 cau hoi mau
- de thi theo tung chuyen de
- 1 de thi tong hop
- bookmark mau
- tien do hoc mau
- lich su lam bai mau

Thiet ke hien tai giu nguyen numbering de cuong, ke ca khi chua co Chuyen de 9.

## 8. Man hinh da trien khai

- Onboarding
- Auth gateway: Guest mode / mock login
- Home dashboard
- Topics list
- Topic detail
- Lesson reader
- Question bank
- Question filter
- Topic exam setup
- Composite exam setup
- Exam session
- Exam result
- Review answers
- Analytics
- Bookmarks
- Search
- Profile
- Settings
- Import / Export

## 9. Logic nghiep vu da co

- Tao de thi tu `ExamDefinition`
- Random chon cau hoi
- Shuffle thu tu dap an
- Practice mode
- Exam simulation mode
- Dong ho dem nguoc
- Chuyen cau truoc / sau
- Danh dau cau chua chac chan
- Tu nop bai khi het gio
- Cham diem
- Breakdown theo chuyen de
- Goi y chuyen de can on lai
- Luu lich su va review dap an

## 10. UI/UX da polish

- Design system nho gon nhung thong nhat
- Hero banner cho onboarding, dashboard, topic detail, exam result
- Responsive layout cho tablet qua max width container
- Card, chip, progress, metric, chart duoc tai su dung
- Mau sac theo huong hanh chinh - dao tao chuyen nghiep
- Light / dark mode preference

## 11. Cach chay

### Yeu cau

- Node.js nen dung `>= 20.19.4`
- npm 9+

Luu y:

- Moi truong phat trien hien tai da verify duoc voi Node `20.13.1`
- Tuy nhien Expo SDK 54 se canh bao engine, nen moi truong deploy/chay that nen nang cap dung version de xuat

### Cai dependency

```bash
npm install
```

### Typecheck

```bash
npm run typecheck
```

### Chay Expo

```bash
npm run start
npm run android
npm run ios
npm run web
```

### Xoa cache Metro neu can

```bash
npm run reset-cache
```

## 12. Kiem tra da thuc hien

Da chay thanh cong:

- `npm run typecheck`
- `npx expo export --platform web`

Chua chay trong moi truong hien tai:

- Android emulator runtime
- iOS simulator runtime

## 13. Import / Export du lieu

Ung dung co san man hinh import/export snapshot:

- Export toan bo persisted learner state thanh JSON
- Import lai snapshot JSON
- Phu hop cho backup local, migration hoac flow admin-ready

File import duoc validate qua `Zod`.

## 14. Huong mo rong tiep theo

### Backend

- REST API / GraphQL cho catalog, exams, analytics
- Auth thuc su
- Cloud sync cho lich su va tien do
- CMS quan ly chuyen de / bai hoc / cau hoi / de thi

### Learning intelligence

- Ca nhan hoa lo trinh hoc
- Goi y on lai theo weak topics
- Streak rules nang cao
- Nhac lich on tap
- Heatmap on tap nang cao hon

### Admin / operations

- Import Excel / CSV / JSON bulk
- Versioning cho question bank
- Review workflow cho hoi dong chuyen mon
- Telemetry, crash reporting, release channel

## 15. Ghi chu ban giao

Du an hien tai la MVP co the mo rong tot:

- Da co luong app day du
- Da co seed data lon de demo
- Da co state offline va snapshot import/export
- Da tach them service + repository de de noi backend that

Neu tiep tuc phase tiep theo, uu tien nen la:

1. Tich hop backend auth + catalog API
2. Dua du lieu chuyen mon that vao he thong import
3. Them test cho service layer va exam engine
4. Chuan hoa CMS / admin workflow
