import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'qrcode';
import { Platform } from 'react-native';

import { APP_DISCLAIMER, APP_NAME, APP_TAGLINE } from '../constants/app';
import { dataTransferKindLabels } from '../constants/dataTransfer';
import { snapshotSchema } from '../types/schemas';
import type {
  AppSnapshot,
  DataTransferRecord,
  ExamHistoryEntry,
  ExamReviewItem,
  LearnerProfile,
  LearningCatalog,
  OptionId,
} from '../types/models';
import { formatDurationSeconds, getDifficultyLabel, getExamCatalogModeLabel, getExperienceModeLabel } from '../utils/format';
import { buildExamResultDetail, buildReviewQuestions } from './examService';

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

function buildSafeFileSegment(value: string) {
  return (
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\u0111/g, 'd')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'report'
  );
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

async function exportPdfFile(html: string, fileName: string) {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return fileName;
  }

  const printResult = await Print.printToFileAsync({ html });
  let targetUri = printResult.uri;

  if (FileSystem.documentDirectory) {
    targetUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.deleteAsync(targetUri, { idempotent: true }).catch(() => undefined);
    await FileSystem.copyAsync({ from: printResult.uri, to: targetUri }).catch(() => {
      targetUri = printResult.uri;
    });
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(targetUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }

  return targetUri;
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

function toHtmlText(value: string | number | boolean | null | undefined) {
  return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

function compactText(value: string, maxLength: number) {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 3).trimEnd()}...`;
}

const reportDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatReportDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : reportDateFormatter.format(parsed);
}

interface ReportMetric {
  label: string;
  value: string;
  helper?: string;
}

interface VerificationInfo {
  code: string;
  payload: string;
  description: string;
  qrSvg: string;
}

interface PdfDocumentParams {
  documentCode: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  heroMetrics: ReportMetric[];
  bodyHtml: string;
  verification?: VerificationInfo;
  footerTitle?: string;
  footerNote?: string;
}

function renderMetricCards(metrics: ReportMetric[]) {
  return metrics
    .map(
      (metric) => `
        <div class="metric-card">
          <span class="metric-label">${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
          ${metric.helper ? `<span class="metric-helper">${escapeHtml(metric.helper)}</span>` : ''}
        </div>`,
    )
    .join('');
}

function renderDefinitionGrid(entries: Array<{ label: string; value: string }>) {
  return `
    <div class="definition-grid">
      ${entries
        .map(
          (entry) => `
            <div class="definition-item">
              <span class="definition-label">${escapeHtml(entry.label)}</span>
              <strong>${toHtmlText(entry.value)}</strong>
            </div>`,
        )
        .join('')}
    </div>`;
}

function renderChipList(values: string[], emptyLabel: string) {
  if (!values.length) {
    return `<p class="empty-copy">${escapeHtml(emptyLabel)}</p>`;
  }

  return `
    <div class="chip-list">
      ${values.map((value) => `<span class="chip">${escapeHtml(value)}</span>`).join('')}
    </div>`;
}

function buildStatusPill(label: string, tone: 'default' | 'success' | 'warning' | 'danger' = 'default') {
  return `<span class="status-pill ${tone}">${escapeHtml(label)}</span>`;
}

function buildBrandMarkSvg() {
  return `
    <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(APP_NAME)} logo">
      <defs>
        <linearGradient id="tendergo-brand-gradient" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stop-color="#0f2740" />
          <stop offset="55%" stop-color="#1b5d8e" />
          <stop offset="100%" stop-color="#4e8dc0" />
        </linearGradient>
        <linearGradient id="tendergo-brand-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f5d9b0" />
          <stop offset="100%" stop-color="#c48f4b" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="64" height="64" rx="20" fill="url(#tendergo-brand-gradient)" />
      <path d="M23 18h18l8 8v20c0 4.4-3.6 8-8 8H23c-4.4 0-8-3.6-8-8V26c0-4.4 3.6-8 8-8Z" fill="rgba(255,255,255,0.14)" />
      <path d="M41 18v8h8" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M24 31h17" stroke="rgba(255,255,255,0.9)" stroke-width="2.8" stroke-linecap="round" />
      <path d="M24 38h14" stroke="rgba(255,255,255,0.72)" stroke-width="2.8" stroke-linecap="round" />
      <path d="M24 45h10" stroke="rgba(255,255,255,0.56)" stroke-width="2.8" stroke-linecap="round" />
      <circle cx="50" cy="48" r="11" fill="url(#tendergo-brand-accent)" />
      <path d="M45.5 48.5 49 52l7-8" fill="none" stroke="#0f2740" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
}

function hashString(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

async function buildVerificationInfo(payload: Record<string, string | number | boolean | null | undefined>) {
  const canonicalPayload = JSON.stringify(payload);
  const signature = hashString(`TenderGO::${canonicalPayload}`);
  const code = `TGX-${signature}`;
  const qrPayload = JSON.stringify({
    ...payload,
    verificationCode: code,
    signature,
  });
  const qrSvg = (await QRCode.toString(qrPayload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    width: 140,
    color: {
      dark: '#0f2740',
      light: '#ffffff',
    },
  })).replace(/<\?xml[^>]*\?>\s*/i, '');

  return {
    code,
    payload: qrPayload,
    description:
      'Mã QR và mã xác thực này dùng cho đối chiếu nội bộ trong TenderGO. Không thay thế quy trình xác minh pháp lý hoặc văn bản chính thức.',
    qrSvg,
  } satisfies VerificationInfo;
}

async function buildPdfDocument({
  documentCode,
  eyebrow,
  title,
  subtitle,
  generatedAt,
  heroMetrics,
  bodyHtml,
  verification,
  footerTitle = 'Lưu ý nghiệp vụ',
  footerNote = APP_DISCLAIMER,
}: PdfDocumentParams) {
  return `<!DOCTYPE html>
  <html lang="vi">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(APP_NAME)} - ${escapeHtml(title)}</title>
      <style>
        @page { margin: 18mm 12mm 18mm; }
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          background: #eef3f8;
          color: #17324d;
          font-family: "Segoe UI", Arial, sans-serif;
        }
        .sheet {
          background: #ffffff;
          border: 1px solid #dbe4ee;
          border-radius: 28px;
          padding: 30px;
        }
        .masthead {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .brand {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .brand-mark {
          width: 72px;
          height: 72px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 72px;
        }
        .brand-mark svg {
          width: 72px;
          height: 72px;
          display: block;
        }
        .brand-copy span,
        .document-code,
        .eyebrow,
        .section-eyebrow,
        .definition-label,
        .metric-label,
        .metric-helper {
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .brand-copy span {
          display: block;
          color: #60758d;
          font-size: 11px;
          margin-bottom: 4px;
        }
        .brand-copy strong {
          display: block;
          font-size: 22px;
          color: #0f2740;
        }
        .brand-copy p {
          margin: 6px 0 0;
          color: #5e7288;
          font-size: 12px;
          line-height: 1.6;
        }
        .brand-copy .brand-tagline {
          color: #244667;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
        }
        .document-code {
          border: 1px solid #c8d6e5;
          border-radius: 999px;
          padding: 8px 14px;
          color: #244667;
          background: #f8fbff;
          font-size: 11px;
          white-space: nowrap;
        }
        .hero {
          background: linear-gradient(135deg, #0f2740 0%, #1b5d8e 58%, #4e8dc0 100%);
          color: #ffffff;
          border-radius: 24px;
          padding: 26px;
          margin-bottom: 18px;
          box-shadow: 0 22px 44px rgba(15, 39, 64, 0.2);
        }
        .eyebrow {
          color: #c0def7;
          font-size: 11px;
          margin-bottom: 10px;
        }
        h1, h2, h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          color: inherit;
        }
        h1 {
          font-size: 31px;
          line-height: 1.18;
          margin-bottom: 10px;
        }
        h2 {
          font-size: 20px;
          color: #0f2740;
          margin-bottom: 8px;
        }
        h3 {
          font-size: 15px;
          color: #0f2740;
          margin-bottom: 8px;
        }
        .hero p,
        .body-copy,
        .empty-copy,
        .section-card p,
        td,
        th,
        li,
        .footer p {
          font-size: 12px;
          line-height: 1.7;
        }
        .hero p {
          margin: 0;
          color: #ebf4fb;
        }
        .meta-inline {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 16px;
          margin-top: 12px;
          color: #cce4f8;
          font-size: 11px;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0 22px;
        }
        .metric-card {
          border: 1px solid #dbe4ee;
          border-radius: 18px;
          padding: 16px 14px;
          background: linear-gradient(180deg, #fbfdff 0%, #f4f8fc 100%);
          min-height: 96px;
        }
        .metric-card strong {
          display: block;
          color: #0f2740;
          font-size: 24px;
          margin: 6px 0;
        }
        .metric-label {
          color: #67809a;
          font-size: 10px;
        }
        .metric-helper {
          display: block;
          color: #7b8ea4;
          font-size: 10px;
          margin-top: 4px;
          line-height: 1.5;
        }
        .section-card {
          border: 1px solid #dbe4ee;
          border-radius: 22px;
          padding: 20px;
          margin-bottom: 16px;
          background: #ffffff;
          page-break-inside: avoid;
        }
        .section-eyebrow {
          display: block;
          color: #6c8298;
          font-size: 10px;
          margin-bottom: 8px;
        }
        .definition-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .definition-item {
          border-radius: 16px;
          background: #f7fafe;
          border: 1px solid #dde7f0;
          padding: 12px 14px;
        }
        .definition-item strong {
          display: block;
          margin-top: 6px;
          color: #1e3956;
          font-size: 13px;
          line-height: 1.7;
        }
        .definition-label {
          color: #67809a;
          font-size: 10px;
        }
        .note-box {
          border-radius: 18px;
          padding: 14px 16px;
          background: linear-gradient(180deg, #f8fbff 0%, #eef5fb 100%);
          border: 1px solid #d5e2ee;
          margin-top: 12px;
        }
        .note-box p { margin: 0; }
        .chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 6px 11px;
          background: #edf4fb;
          border: 1px solid #d5e2ee;
          color: #274663;
          font-size: 11px;
          line-height: 1.3;
        }
        .table-shell {
          border: 1px solid #dbe4ee;
          border-radius: 18px;
          overflow: hidden;
          margin-top: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px 12px;
          vertical-align: top;
          border-bottom: 1px solid #e4ebf2;
          text-align: left;
        }
        th {
          background: #f4f8fc;
          color: #1b3958;
          font-size: 11px;
        }
        tbody tr:last-child td { border-bottom: none; }
        .status-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          line-height: 1.2;
          border: 1px solid #d0dbe7;
          background: #f4f8fc;
          color: #284664;
        }
        .status-pill.success {
          background: #edf8f1;
          border-color: #cbe9d2;
          color: #1b6b3a;
        }
        .status-pill.warning {
          background: #fff6e8;
          border-color: #f0dec0;
          color: #8c5d12;
        }
        .status-pill.danger {
          background: #fff0ef;
          border-color: #f0d0cc;
          color: #97312a;
        }
        .question-detail {
          border-top: 1px dashed #ccd8e3;
          padding-top: 16px;
          margin-top: 16px;
          page-break-inside: avoid;
        }
        .question-meta {
          color: #62788f;
          font-size: 11px;
          margin: 6px 0 10px;
        }
        .question-stem {
          margin: 0 0 10px;
          color: #1a324b;
        }
        .option-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }
        .option-item {
          display: flex;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid #dbe4ee;
          background: #fafcff;
        }
        .option-item.correct {
          border-color: #b5dec0;
          background: #edf8f1;
        }
        .option-item.missed {
          border-color: #e8c3be;
          background: #fff3f1;
        }
        .option-item.selected {
          box-shadow: inset 0 0 0 1px #7ca4cb;
        }
        .option-code {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #dbe7f2;
          color: #15324d;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex: 0 0 22px;
          margin-top: 1px;
        }
        .verification-panel {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-top: 20px;
          padding: 16px 18px;
          border: 1px solid #dbe4ee;
          border-radius: 20px;
          background: linear-gradient(180deg, #f8fbff 0%, #eef5fb 100%);
          page-break-inside: avoid;
        }
        .verification-copy {
          flex: 1;
          min-width: 0;
        }
        .verification-copy strong {
          display: block;
          color: #0f2740;
          font-size: 16px;
          margin-bottom: 6px;
          font-family: Georgia, "Times New Roman", serif;
        }
        .verification-meta {
          display: grid;
          gap: 6px;
          margin-top: 12px;
        }
        .verification-code {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          max-width: 100%;
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid #ccd8e4;
          background: #ffffff;
          color: #17324d;
          font-size: 11px;
          line-height: 1.4;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          word-break: break-all;
        }
        .verification-payload {
          color: #62788f;
          font-size: 10px;
          line-height: 1.6;
          word-break: break-all;
        }
        .verification-qr {
          width: 132px;
          height: 132px;
          flex: 0 0 132px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid #d9e4ef;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
        }
        .verification-qr svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px dashed #cbd8e4;
          color: #62788f;
        }
        .footer strong { color: #16324d; }
        @media print {
          body { background: #ffffff; }
          .sheet {
            border: none;
            border-radius: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="masthead">
          <div class="brand">
            <div class="brand-mark">${buildBrandMarkSvg()}</div>
            <div class="brand-copy">
              <span>Hồ sơ sản phẩm chính thức</span>
              <strong>${escapeHtml(APP_NAME)}</strong>
              <p class="brand-tagline">${escapeHtml(APP_TAGLINE)}</p>
              <p>Bản in phục vụ vận hành nội bộ, đối chiếu nội dung và tổng hợp kết quả học tập.</p>
            </div>
          </div>
          <div class="document-code">${escapeHtml(documentCode)}</div>
        </div>
        <div class="hero">
          <div class="eyebrow">${escapeHtml(eyebrow)}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(subtitle)}</p>
          <div class="meta-inline">
            <span>Ngày lập: ${escapeHtml(formatReportDate(generatedAt))}</span>
            <span>Nền tảng: ${escapeHtml(APP_NAME)}</span>
            <span>Chế độ dữ liệu: offline ready</span>
          </div>
        </div>
        <div class="metric-grid">${renderMetricCards(heroMetrics)}</div>
        ${bodyHtml}
        ${
          verification
            ? `
              <div class="verification-panel">
                <div class="verification-copy">
                  <strong>Xác thực nội bộ</strong>
                  <p>${escapeHtml(verification.description)}</p>
                  <div class="verification-meta">
                    <span class="verification-code">${escapeHtml(verification.code)}</span>
                    <span class="verification-payload">${escapeHtml(compactText(verification.payload, 220))}</span>
                  </div>
                </div>
                <div class="verification-qr">${verification.qrSvg}</div>
              </div>`
            : ''
        }
        <div class="footer">
          <p><strong>${escapeHtml(footerTitle)}:</strong> ${escapeHtml(footerNote)}</p>
        </div>
      </div>
    </body>
  </html>`;
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

interface BuildExamResultReportParams {
  profile: LearnerProfile;
  catalog: LearningCatalog;
  historyEntry: ExamHistoryEntry;
  reviewItems: ExamReviewItem[];
}

function buildTopicPerformanceSummary(catalog: LearningCatalog, history: ExamHistoryEntry[]) {
  const aggregate = new Map<string, { correct: number; total: number }>();

  history.forEach((entry) => {
    entry.topicBreakdown.forEach((item) => {
      const previous = aggregate.get(item.topicId) ?? { correct: 0, total: 0 };
      aggregate.set(item.topicId, {
        correct: previous.correct + item.correct,
        total: previous.total + item.total,
      });
    });
  });

  const items = Array.from(aggregate.entries())
    .map(([topicId, stats]) => {
      const topic = catalog.topics.find((candidate) => candidate.id === topicId);
      return {
        topicId,
        topicCode: topic?.code ?? topicId,
        topicName: topic?.name ?? topicId,
        correct: stats.correct,
        total: stats.total,
        accuracy: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0,
      };
    })
    .filter((item) => item.total > 0);

  if (!items.length) {
    return { strongest: null, weakest: null };
  }

  const weakest = [...items].sort((left, right) => left.accuracy - right.accuracy || right.total - left.total)[0] ?? null;
  const strongest = [...items].sort((left, right) => right.accuracy - left.accuracy || right.total - left.total)[0] ?? null;

  return { strongest, weakest };
}

async function buildAdminReportHtml({ profile, catalog, history, transferHistory }: BuildAdminReportParams) {
  const sourceTopics = catalog.topics.filter((topic) => topic.sourceDocument);
  const sourceExams = catalog.exams.filter((exam) => exam.sourceFile);
  const importedFiles = Array.from(
    new Set(
      sourceTopics
        .map((topic) => topic.sourceDocument?.fileName)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const recentHistory = history.slice(0, 8);
  const recentTransfers = transferHistory.slice(0, 8);
  const topicQuestionCountMap = new Map(
    catalog.topics.map((topic) => [
      topic.id,
      catalog.questions.filter((question) => question.topicId === topic.id).length,
    ]),
  );
  const averageScore = history.length
    ? Math.round(history.reduce((total, entry) => total + entry.scorePercentage, 0) / history.length)
    : null;
  const passRateAt75 = history.length
    ? Math.round((history.filter((entry) => entry.scorePercentage >= 75).length / history.length) * 100)
    : null;
  const topicPerformance = buildTopicPerformanceSummary(catalog, history);
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
          <td>${escapeHtml(exam.sourceLabel ?? 'Đề nguồn nghiệp vụ')}</td>
        </tr>`,
    )
    .join('');

  const historyRows = recentHistory
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(entry.title)}</td>
          <td>${escapeHtml(getExamCatalogModeLabel(entry.catalogMode))}</td>
          <td>${escapeHtml(getExperienceModeLabel(entry.experienceMode))}</td>
          <td>${escapeHtml(entry.scorePercentage)}%</td>
          <td>${escapeHtml(entry.correctCount)}/${escapeHtml(entry.totalQuestions)}</td>
          <td>${escapeHtml(formatReportDate(entry.completedAt))}</td>
        </tr>`,
    )
    .join('');

  const transferRows = recentTransfers
    .map((record) => {
      const tone =
        record.status === 'success' ? 'success' : record.status === 'canceled' ? 'warning' : 'danger';

      return `
        <tr>
          <td>${escapeHtml(dataTransferKindLabels[record.kind])}</td>
          <td>${buildStatusPill(record.status, tone)}</td>
          <td>${escapeHtml(record.fileName)}</td>
          <td>${escapeHtml(formatReportDate(record.createdAt))}</td>
          <td>${escapeHtml(compactText(record.note ?? '', 120))}</td>
        </tr>`;
    })
    .join('');

  const executiveSummary = [
    `Hệ thống hiện có ${sourceTopics.length} chuyên đề gắn file nguồn, ${catalog.lessons.length} bài học và ${catalog.questions.length} câu hỏi sẵn sàng cho chế độ offline.`,
    averageScore === null
      ? 'Chưa có lịch sử thi đủ để kết luận xu hướng kết quả học tập.'
      : `Điểm trung bình hiện tại đạt ${averageScore}%, tỷ lệ bài chạm mốc 75% là ${passRateAt75}%.`,
    topicPerformance.weakest
      ? `Chuyên đề cần ưu tiên ôn lại là ${topicPerformance.weakest.topicCode} - ${topicPerformance.weakest.topicName} với độ chính xác khoảng ${topicPerformance.weakest.accuracy}%.`
      : 'Chưa đủ dữ liệu để xác định chuyên đề yếu nhất.',
  ];

  const verification = await buildVerificationInfo({
    documentType: 'admin_report',
    documentCode: 'TG-ADMIN-REPORT',
    profileId: profile.id,
    issuedTo: profile.displayName,
    generatedAt,
    sourceTopicCount: sourceTopics.length,
    sourceExamCount: sourceExams.length,
    historyCount: history.length,
  });

  return buildPdfDocument({
    documentCode: 'TG-ADMIN-REPORT',
    eyebrow: 'Báo cáo vận hành nội dung',
    title: 'Báo cáo dữ liệu và ôn tập',
    subtitle: `${catalog.program.name}. Tài liệu tổng hợp dành cho quản trị nội dung, đối chiếu seed và theo dõi kết quả học tập.`,
    generatedAt,
    heroMetrics: [
      { label: 'Chuyên đề nguồn', value: `${sourceTopics.length}`, helper: 'Đã gắn tệp nguồn' },
      { label: 'Bài học', value: `${catalog.lessons.length}`, helper: 'Sẵn sàng offline' },
      { label: 'Câu hỏi', value: `${catalog.questions.length}`, helper: 'Ngân hàng hiện có' },
      { label: 'Điểm trung bình', value: averageScore === null ? '--' : `${averageScore}%`, helper: 'Theo lịch sử thi' },
    ],
    verification,
    bodyHtml: `
      <section class="section-card">
        <span class="section-eyebrow">Tóm tắt điều hành</span>
        <h2>Trạng thái nội dung và học tập</h2>
        ${executiveSummary.map((paragraph) => `<p class="body-copy">${escapeHtml(paragraph)}</p>`).join('')}
        <div class="note-box">
          <p>
            <strong>Gợi ý nhanh:</strong>
            ${
              topicPerformance.strongest
                ? ` Kết quả tốt nhất hiện nay nghiêng về ${escapeHtml(topicPerformance.strongest.topicCode)} - ${escapeHtml(
                    topicPerformance.strongest.topicName,
                  )} (${escapeHtml(topicPerformance.strongest.accuracy)}%).`
                : ' Chưa có dữ liệu để xác định chuyên đề mạnh nhất.'
            }
          </p>
        </div>
      </section>

      <section class="section-card">
        <span class="section-eyebrow">Hồ sơ người học</span>
        <h2>Thông tin tổng quan</h2>
        ${renderDefinitionGrid([
          { label: 'Người dùng', value: profile.displayName },
          { label: 'Vai trò', value: profile.roleLabel },
          { label: 'Mục tiêu', value: profile.learningGoal },
          { label: 'Study target', value: `${profile.dailyStudyMinutes} phút/ngày` },
          { label: 'Streak', value: `${profile.streakDays} ngày` },
          { label: 'Ngày tham gia', value: formatReportDate(profile.joinedAt) },
        ])}
      </section>

      <section class="section-card">
        <span class="section-eyebrow">Nguồn tài liệu</span>
        <h2>Danh mục file và chuyên đề đã nạp</h2>
        <p class="body-copy">Danh sách dưới đây giúp đối chiếu nhanh giữa data seed trong app và tài liệu nghiệp vụ gốc.</p>
        ${renderChipList(importedFiles, 'Chưa ghi nhận file nguồn nào.')}
        <div class="table-shell">
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
      </section>

      <section class="section-card">
        <span class="section-eyebrow">Đề thi và kết quả</span>
        <h2>Bộ đề nguồn và lịch sử thi gần đây</h2>
        <div class="table-shell">
          <table>
            <thead>
              <tr>
                <th>Tên đề</th>
                <th>File nguồn</th>
                <th>Số câu</th>
                <th>Thời gian</th>
                <th>Nhãn</th>
              </tr>
            </thead>
            <tbody>
              ${sourceExamRows || '<tr><td colspan="5">Chưa có đề thi nguồn.</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="table-shell">
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
      </section>

      <section class="section-card">
        <span class="section-eyebrow">Audit trail</span>
        <h2>Lịch sử thao tác dữ liệu</h2>
        <p class="body-copy">Giữ dấu vết import/export để phục vụ kiểm tra nội bộ và truy vết thao tác gần nhất.</p>
        <div class="table-shell">
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
      </section>`,
  });
}
async function buildExamResultHtml({ profile, catalog, historyEntry, reviewItems }: BuildExamResultReportParams) {
  const examDefinition = catalog.exams.find((exam) => exam.id === historyEntry.examId);
  const passingScore = examDefinition?.passingScore ?? 75;
  const passed = historyEntry.scorePercentage >= passingScore;
  const breakdown = buildExamResultDetail(catalog, historyEntry);
  const reviewQuestions = buildReviewQuestions(catalog, reviewItems);
  const topicMap = new Map(catalog.topics.map((topic) => [topic.id, topic]));
  const answeredCount = reviewItems.filter((item) => item.selectedAnswer !== null).length;
  const incorrectCount = historyEntry.totalQuestions - historyEntry.correctCount;
  const generatedAt = new Date().toISOString();

  const breakdownRows = breakdown
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.topicCode)}</td>
          <td>${escapeHtml(item.topicName)}</td>
          <td>${escapeHtml(item.correct)}/${escapeHtml(item.total)}</td>
          <td>${item.total ? escapeHtml(Math.round((item.correct / item.total) * 100)) : 0}%</td>
        </tr>`,
    )
    .join('');

  const reviewSummaryRows = reviewQuestions
    .map(({ question, reviewItem }, index) => {
      const topic = topicMap.get(question.topicId);
      const resultLabel = reviewItem.isCorrect ? 'Đúng' : reviewItem.selectedAnswer ? 'Sai' : 'Bỏ trống';
      const tone = reviewItem.isCorrect ? 'success' : reviewItem.selectedAnswer ? 'danger' : 'warning';

      return `
        <tr>
          <td>${escapeHtml(index + 1)}</td>
          <td>${escapeHtml(topic?.code ?? question.topicId)}</td>
          <td>${escapeHtml(compactText(question.question, 110))}</td>
          <td>${escapeHtml(reviewItem.selectedAnswer ?? '--')}</td>
          <td>${escapeHtml(reviewItem.correctAnswer)}</td>
          <td>${buildStatusPill(resultLabel, tone)}</td>
        </tr>`;
    })
    .join('');

  const itemsNeedingReview = reviewQuestions
    .map((item, index) => ({ ...item, index }))
    .filter(({ reviewItem }) => !reviewItem.isCorrect || reviewItem.selectedAnswer === null);

  const detailedReviewSections = itemsNeedingReview
    .map(({ question, reviewItem, index }) => {
      const topic = topicMap.get(question.topicId);
      const optionMap = new Map(question.options.map((option) => [option.id, option]));
      const orderedOptions =
        reviewItem.optionOrder.length > 0 ? reviewItem.optionOrder : question.options.map((option) => option.id);

      const optionItems = orderedOptions
        .map((optionId) => {
          const option = optionMap.get(optionId as OptionId);
          if (!option) {
            return '';
          }

          const classes = ['option-item'];
          if (optionId === reviewItem.correctAnswer) {
            classes.push('correct');
          }
          if (optionId === reviewItem.selectedAnswer) {
            classes.push(reviewItem.isCorrect ? 'selected' : 'missed');
          }

          return `
            <li class="${classes.join(' ')}">
              <span class="option-code">${escapeHtml(option.id)}</span>
              <span>${toHtmlText(option.label)}</span>
            </li>`;
        })
        .join('');

      return `
        <div class="question-detail">
          <h3>Câu ${escapeHtml(index + 1)} - cần ôn lại</h3>
          <p class="question-meta">
            ${escapeHtml(topic?.code ?? question.topicId)} • ${escapeHtml(getDifficultyLabel(question.difficulty))} • ${escapeHtml(question.source)}
          </p>
          <p class="question-stem">${toHtmlText(question.question)}</p>
          <ul class="option-list">${optionItems}</ul>
          <div class="note-box">
            <p><strong>Giải thích:</strong> ${toHtmlText(question.explanation)}</p>
          </div>
        </div>`;
    })
    .join('');

  const summaryMessage = passed
    ? `Học viên đã vượt mốc đạt ${passingScore}% với kết quả ${historyEntry.scorePercentage}%. Có thể chuyển sang vòng luyện đề tổng hợp hoặc mô phỏng thi.`
    : `Kết quả hiện tại là ${historyEntry.scorePercentage}%, thấp hơn mốc đạt ${passingScore}%. Nên ưu tiên rà lại các chuyên đề yếu và các câu sai ở phần cuối báo cáo.`;

  const verification = await buildVerificationInfo({
    documentType: 'exam_result',
    documentCode: `TG-EXAM-${historyEntry.id.slice(-6).toUpperCase()}`,
    historyId: historyEntry.id,
    examId: historyEntry.examId,
    issuedTo: profile.displayName,
    completedAt: historyEntry.completedAt,
    score: historyEntry.scorePercentage,
    totalQuestions: historyEntry.totalQuestions,
  });

  return buildPdfDocument({
    documentCode: `TG-EXAM-${historyEntry.id.slice(-6).toUpperCase()}`,
    eyebrow: 'Hồ sơ kết quả bài thi',
    title: historyEntry.title,
    subtitle: `Phiếu tổng hợp dành cho học viên ${profile.displayName}, ghi nhận kết quả và các điểm cần ôn lại sau bài làm.`,
    generatedAt,
    heroMetrics: [
      { label: 'Điểm số', value: `${historyEntry.scorePercentage}%`, helper: passed ? 'Vượt mốc đạt' : 'Cần ôn thêm' },
      { label: 'Câu đúng', value: `${historyEntry.correctCount}/${historyEntry.totalQuestions}`, helper: `${incorrectCount} câu cần xử lý` },
      { label: 'Đã trả lời', value: `${answeredCount}/${historyEntry.totalQuestions}`, helper: `${historyEntry.flaggedCount} câu đã đánh dấu` },
      { label: 'Thời gian', value: formatDurationSeconds(historyEntry.durationSeconds), helper: getExperienceModeLabel(historyEntry.experienceMode) },
    ],
    verification,
    bodyHtml: `
      <section class="section-card">
        <span class="section-eyebrow">Kết luận nhanh</span>
        <h2>Đánh giá sau bài thi</h2>
        <p class="body-copy">${escapeHtml(summaryMessage)}</p>
        <div class="note-box">
          <p><strong>Khuyến nghị:</strong> ${
            historyEntry.weakTopicIds.length
              ? `Tập trung ôn lại ${historyEntry.weakTopicIds
                  .map((topicId) => {
                    const topic = catalog.topics.find((candidate) => candidate.id === topicId);
                    return topic ? `${topic.code} - ${topic.name}` : topicId;
                  })
                  .join('; ')}.`
              : 'Kết quả phân bổ khá đồng đều, có thể tăng độ khó hoặc chuyển sang đề tổng hợp.'
          }</p>
        </div>
      </section>

      <section class="section-card">
        <span class="section-eyebrow">Thông tin hồ sơ</span>
        <h2>Học viên và bài thi</h2>
        ${renderDefinitionGrid([
          { label: 'Học viên', value: profile.displayName },
          { label: 'Vai trò', value: profile.roleLabel },
          { label: 'Loại đề', value: getExamCatalogModeLabel(historyEntry.catalogMode) },
          { label: 'Chế độ', value: getExperienceModeLabel(historyEntry.experienceMode) },
          { label: 'Bắt đầu', value: formatReportDate(historyEntry.startedAt) },
          { label: 'Hoàn thành', value: formatReportDate(historyEntry.completedAt) },
          { label: 'Mốc đạt', value: `${passingScore}%` },
          { label: 'Nguồn đề', value: examDefinition?.sourceFile ?? examDefinition?.sourceLabel ?? 'Đề sinh trong hệ thống' },
        ])}
      </section>

      <section class="section-card">
        <span class="section-eyebrow">Breakdown chuyên đề</span>
        <h2>Tỷ lệ đúng theo chuyên đề</h2>
        <div class="table-shell">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Chuyên đề</th>
                <th>Kết quả</th>
                <th>Độ chính xác</th>
              </tr>
            </thead>
            <tbody>
              ${breakdownRows || '<tr><td colspan="4">Không có dữ liệu breakdown.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section-card">
        <span class="section-eyebrow">Tổng hợp đáp án</span>
        <h2>Bảng review nhanh từng câu</h2>
        ${
          reviewSummaryRows
            ? `
              <div class="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Chuyên đề</th>
                      <th>Nội dung câu hỏi</th>
                      <th>Bạn chọn</th>
                      <th>Đáp án</th>
                      <th>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${reviewSummaryRows}
                  </tbody>
                </table>
              </div>`
            : '<p class="empty-copy">Phiên bản dữ liệu này chưa lưu chi tiết đáp án để xuất bảng review.</p>'
        }
      </section>

      <section class="section-card">
        <span class="section-eyebrow">Cần ôn lại</span>
        <h2>Câu sai và bỏ trống</h2>
        ${
          detailedReviewSections
            ? detailedReviewSections
            : '<p class="body-copy">Không ghi nhận câu sai hoặc bỏ trống trong bài thi này.</p>'
        }
      </section>`,
  });
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
  const html = await buildAdminReportHtml(params);
  return exportPdfFile(html, buildPdfFileName('admin-report'));
}

export async function exportExamResultPdf(params: BuildExamResultReportParams) {
  const prefix = `exam-result-${buildSafeFileSegment(params.historyEntry.title)}`;
  const html = await buildExamResultHtml(params);
  return exportPdfFile(html, buildPdfFileName(prefix));
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
