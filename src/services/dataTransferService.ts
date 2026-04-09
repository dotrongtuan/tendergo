import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { snapshotSchema } from '../types/schemas';
import type { AppSnapshot, ExamHistoryEntry, LearningCatalog } from '../types/models';

function buildDateToken() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function buildSnapshotFileName() {
  return `tendergo-snapshot-${buildDateToken()}.json`;
}

function buildCsvFileName(prefix: string) {
  return `tendergo-${prefix}-${buildDateToken()}.csv`;
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

export async function exportQuestionBankCsv(catalog: LearningCatalog) {
  return exportTextFile(buildQuestionBankCsv(catalog), buildCsvFileName('question-bank'), 'text/csv;charset=utf-8');
}

export async function exportExamHistoryCsv(history: ExamHistoryEntry[], catalog: LearningCatalog) {
  return exportTextFile(buildExamHistoryCsv(history, catalog), buildCsvFileName('exam-history'), 'text/csv;charset=utf-8');
}

export async function exportTopicCatalogCsv(catalog: LearningCatalog) {
  return exportTextFile(buildTopicCatalogCsv(catalog), buildCsvFileName('topic-catalog'), 'text/csv;charset=utf-8');
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
