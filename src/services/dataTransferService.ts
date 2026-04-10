import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { APP_DISCLAIMER, APP_NAME } from '../constants/app';
import { snapshotSchema } from '../types/schemas';
import type {
  AppSnapshot,
  DataTransferRecord,
  ExamHistoryEntry,
  LearnerProfile,
  LearningCatalog,
} from '../types/models';

function buildDateToken() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function buildSnapshotFileName() {
  return `tendergo-snapshot-${buildDateToken()}.json`;
}

function buildCsvFileName(prefix: string) {
  return `tendergo-${prefix}-${buildDateToken()}.csv`;
}

function buildPdfFileName(prefix: string) {
  return `tendergo-${prefix}-${buildDateToken()}.pdf`;
}

async function exportTextFile(payload: string, fileName: string, mimeType: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([payload], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return fileName;
  }

  const directory = FileSystem.documentDirectory;

  if (!directory) {
    throw new Error('Không tìm thấy thư mục lưu trữ cục bộ.');
  }

  const fileUri = `${directory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, payload);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType });
  }

  return fileUri;
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const text = String(value ?? '').replace(/"/g, '""');
  return `"${text}"`;
}

function serializeCsv(rows: Array<Array<string | number | boolean | null | undefined>>) {
  return `\uFEFF${rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')}`;
}

function escapeHtml(value: string | number | boolean | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const reportDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatReportDate(value: string) {
  return reportDateFormatter.format(new Date(value));
}

export function buildQuestionBankCsv(catalog: LearningCatalog) {
  const topicMap = new Map(catalog.topics.map((topic) => [topic.id, topic]));
  const lessonMap = new Map(catalog.lessons.map((lesson) => [lesson.id, lesson]));

  return serializeCsv([
    [
      'questionId',
      'topicCode',
      'topicName',
      'lessonTitle',
      'difficulty',
      'correctAnswer',
      'question',
      'optionA',
      'optionB',
      'optionC',
      'optionD',
      'tags',
      'source',
      'explanation',
    ],
    ...catalog.questions.map((question) => {
      const topic = topicMap.get(question.topicId);
      const lesson = question.lessonId ? lessonMap.get(question.lessonId) : undefined;
      const optionMap = Object.fromEntries(question.options.map((option) => [option.id, option.label]));

      return [
        question.id,
        topic?.code ?? question.topicId,
        topic?.name ?? question.topicId,
        lesson?.title ?? '',
        question.difficulty,
        question.correctAnswer,
        question.question,
        optionMap.A ?? '',
        optionMap.B ?? '',
        optionMap.C ?? '',
        optionMap.D ?? '',
        question.tags.join(' | '),
        question.source,
        question.explanation,
      ];
    }),
  ]);
}

export function buildExamHistoryCsv(history: ExamHistoryEntry[], catalog: LearningCatalog) {
  const topicMap = new Map(catalog.topics.map((topic) => [topic.id, topic]));

  return serializeCsv([
    [
      'historyId',
      'examId',
      'title',
      'catalogMode',
      'experienceMode',
      'startedAt',
      'completedAt',
      'durationSeconds',
      'scorePercentage',
      'totalQuestions',
      'correctCount',
      'flaggedCount',
      'weakTopics',
      'topicBreakdown',
    ],
    ...history.map((entry) => [
      entry.id,
      entry.examId,
      entry.title,
      entry.catalogMode,
      entry.experienceMode,
      entry.startedAt,
      entry.completedAt,
      entry.durationSeconds,
      entry.scorePercentage,
      entry.totalQuestions,
      entry.correctCount,
      entry.flaggedCount,
      entry.weakTopicIds.map((topicId) => topicMap.get(topicId)?.code ?? topicId).join(' | '),
      entry.topicBreakdown
        .map((item) => `${topicMap.get(item.topicId)?.code ?? item.topicId}: ${item.correct}/${item.total}`)
        .join(' | '),
    ]),
  ]);
}

export function buildTopicCatalogCsv(catalog: LearningCatalog) {
  return serializeCsv([
    [
      'topicId',
      'code',
      'name',
      'shortDescription',
      'estimatedStudyTime',
      'lessonCount',
      'questionCount',
      'sourceFile',
      'documentTitle',
      'legalReferences',
      'tags',
    ],
    ...catalog.topics.map((topic) => [
      topic.id,
      topic.code,
      topic.name,
      topic.shortDescription,
      topic.estimatedStudyTime,
      topic.lessonIds.length,
      catalog.questions.filter((question) => question.topicId === topic.id).length,
      topic.sourceDocument?.fileName ?? '',
      topic.sourceDocument?.documentTitle ?? '',
      topic.sourceDocument?.legalReferences.join(' | ') ?? '',
      topic.tags.join(' | '),
    ]),
  ]);
}

interface BuildAdminReportParams {
  profile: LearnerProfile;
  catalog: LearningCatalog;
  history: ExamHistoryEntry[];
  transferHistory: DataTransferRecord[];
}

function buildAdminReportHtml({ profile, catalog, history, transferHistory }: BuildAdminReportParams) {
  const sourceTopics = catalog.topics.filter((topic) => topic.sourceDocument);
  const sourceExams = catalog.exams.filter((exam) => exam.sourceFile);
  const importedFiles = sourceTopics
    .map((topic) => topic.sourceDocument?.fileName)
    .filter((value): value is string => Boolean(value));
  const recentHistory = history.slice(0, 8);
  const recentTransfers = transferHistory.slice(0, 8);
  const topicQuestionCountMap = new Map(
    catalog.topics.map((topic) => [
      topic.id,
      catalog.questions.filter((question) => question.topicId === topic.id).length,
    ]),
  );
  const generatedAt = new Date().toISOString();

  const sourceTopicRows = sourceTopics
    .map(
      (topic) => `
        <tr>
          <td>${escapeHtml(topic.code)}</td>
          <td>${escapeHtml(topic.name)}</td>
          <td>${escapeHtml(topic.sourceDocument?.fileName ?? '')}</td>
          <td>${escapeHtml(topic.sourceDocument?.documentTitle ?? '')}</td>
          <td>${escapeHtml(topic.lessonIds.length)}</td>
          <td>${escapeHtml(topicQuestionCountMap.get(topic.id) ?? 0)}</td>
        </tr>`,
    )
    .join('');

  const sourceExamRows = sourceExams
    .map(
      (exam) => `
        <tr>
          <td>${escapeHtml(exam.title)}</td>
          <td>${escapeHtml(exam.sourceFile ?? '')}</td>
          <td>${escapeHtml(exam.numberOfQuestions)}</td>
          <td>${escapeHtml(exam.durationMinutes)} phút</td>
        </tr>`,
    )
    .join('');

  const historyRows = recentHistory
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(entry.title)}</td>
          <td>${escapeHtml(entry.catalogMode)}</td>
          <td>${escapeHtml(entry.experienceMode)}</td>
          <td>${escapeHtml(entry.scorePercentage)}%</td>
          <td>${escapeHtml(entry.correctCount)}/${escapeHtml(entry.totalQuestions)}</td>
          <td>${escapeHtml(formatReportDate(entry.completedAt))}</td>
        </tr>`,
    )
    .join('');

  const transferRows = recentTransfers
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.kind)}</td>
          <td>${escapeHtml(record.status)}</td>
          <td>${escapeHtml(record.fileName)}</td>
          <td>${escapeHtml(formatReportDate(record.createdAt))}</td>
          <td>${escapeHtml(record.note ?? '')}</td>
        </tr>`,
    )
    .join('');

  const importedFileItems = importedFiles
    .map((fileName) => `<li>${escapeHtml(fileName)}</li>`)
    .join('');

  return `<!DOCTYPE html>
  <html lang="vi">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(APP_NAME)} - Bao cao du lieu</title>
      <style>
        body {
          font-family: "Segoe UI", Arial, sans-serif;
          color: #243447;
          margin: 0;
          padding: 32px;
          background: #f4f7fb;
        }
        .page {
          background: #ffffff;
          border: 1px solid #d9e2ec;
          border-radius: 20px;
          padding: 28px 32px;
        }
        .hero {
          background: linear-gradient(135deg, #0f2740 0%, #1b5d8e 100%);
          color: white;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 24px;
        }
        h1, h2 {
          margin: 0 0 8px 0;
          font-family: Georgia, "Times New Roman", serif;
        }
        h1 { font-size: 30px; }
        h2 { font-size: 20px; margin-top: 26px; }
        p, li, td, th { font-size: 12px; line-height: 1.55; }
        .muted { color: #6b7b8f; }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }
        .metric {
          border: 1px solid #d9e2ec;
          border-radius: 14px;
          padding: 14px;
          background: #f8fbff;
        }
        .metric strong {
          display: block;
          font-size: 22px;
          color: #0f2740;
          margin-top: 6px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th, td {
          border: 1px solid #d9e2ec;
          padding: 8px 10px;
          vertical-align: top;
        }
        th {
          background: #eef4fb;
          text-align: left;
          color: #0f2740;
        }
        .section {
          margin-top: 20px;
        }
        ul {
          margin: 10px 0 0 18px;
          padding: 0;
        }
        .footer {
          margin-top: 24px;
          padding-top: 14px;
          border-top: 1px dashed #c6d3e1;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="hero">
          <h1>Báo cáo dữ liệu và ôn tập</h1>
          <p>${escapeHtml(catalog.program.name)}</p>
          <p class="muted">Sinh lúc ${escapeHtml(formatReportDate(generatedAt))} cho hồ sơ ${escapeHtml(profile.displayName)}.</p>
        </div>

        <div class="meta-grid">
          <div class="metric">Chuyên đề nguồn<strong>${escapeHtml(sourceTopics.length)}</strong></div>
          <div class="metric">Bài học<strong>${escapeHtml(catalog.lessons.length)}</strong></div>
          <div class="metric">Câu hỏi<strong>${escapeHtml(catalog.questions.length)}</strong></div>
          <div class="metric">Lịch sử thi<strong>${escapeHtml(history.length)}</strong></div>
        </div>

        <div class="section">
          <h2>Hồ sơ học viên</h2>
          <p><strong>Người dùng:</strong> ${escapeHtml(profile.displayName)}</p>
          <p><strong>Vai trò:</strong> ${escapeHtml(profile.roleLabel)}</p>
          <p><strong>Mục tiêu:</strong> ${escapeHtml(profile.learningGoal)}</p>
          <p><strong>Streak:</strong> ${escapeHtml(profile.streakDays)} ngày</p>
        </div>

        <div class="section">
          <h2>File nguồn đã nhập</h2>
          ${importedFiles.length ? `<ul>${importedFileItems}</ul>` : '<p>Chưa có file nguồn được ghi nhận.</p>'}
        </div>

        <div class="section">
          <h2>Danh mục chuyên đề nguồn</h2>
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Chuyên đề</th>
                <th>File nguồn</th>
                <th>Tài liệu</th>
                <th>Bài học</th>
                <th>Câu hỏi</th>
              </tr>
            </thead>
            <tbody>
              ${sourceTopicRows || '<tr><td colspan="6">Chưa có dữ liệu.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Đề thi nguồn</h2>
          <table>
            <thead>
              <tr>
                <th>Tên đề</th>
                <th>File nguồn</th>
                <th>Số câu</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              ${sourceExamRows || '<tr><td colspan="4">Chưa có dữ liệu.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Lịch sử thi gần nhất</h2>
          <table>
            <thead>
              <tr>
                <th>Bài thi</th>
                <th>Loại</th>
                <th>Chế độ</th>
                <th>Điểm</th>
                <th>Kết quả</th>
                <th>Hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              ${historyRows || '<tr><td colspan="6">Chưa có lịch sử thi.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Lịch sử thao tác dữ liệu</h2>
          <table>
            <thead>
              <tr>
                <th>Loại thao tác</th>
                <th>Trạng thái</th>
                <th>Tệp</th>
                <th>Thời điểm</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              ${transferRows || '<tr><td colspan="5">Chưa có log thao tác.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p><strong>Lưu ý nghiệp vụ:</strong> ${escapeHtml(APP_DISCLAIMER)}</p>
        </div>
      </div>
    </body>
  </html>`;
}

export async function exportQuestionBankCsv(catalog: LearningCatalog) {
  return exportTextFile(buildQuestionBankCsv(catalog), buildCsvFileName('question-bank'), 'text/csv;charset=utf-8');
}

export async function exportExamHistoryCsv(history: ExamHistoryEntry[], catalog: LearningCatalog) {
  return exportTextFile(buildExamHistoryCsv(history, catalog), buildCsvFileName('exam-history'), 'text/csv;charset=utf-8');
}

export async function exportTopicCatalogCsv(catalog: LearningCatalog) {
  return exportTextFile(buildTopicCatalogCsv(catalog), buildCsvFileName('topic-catalog'), 'text/csv;charset=utf-8');
}

export async function exportAdminReportPdf(params: BuildAdminReportParams) {
  const fileName = buildPdfFileName('admin-report');
  const html = buildAdminReportHtml(params);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return fileName;
  }

  const printResult = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(printResult.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }

  return printResult.uri;
}

export async function exportSnapshotFile(snapshot: AppSnapshot) {
  const payload = JSON.stringify(snapshot, null, 2);
  return exportTextFile(payload, buildSnapshotFileName(), 'application/json');
}

export async function importSnapshotFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json'],
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];

  if (!asset) {
    return null;
  }

  const content =
    Platform.OS === 'web'
      ? await fetch(asset.uri).then((response) => response.text())
      : await FileSystem.readAsStringAsync(asset.uri);

  return snapshotSchema.parse(JSON.parse(content));
}
