import type { ExamHistoryEntry, ExamReviewItem, LearningCatalog } from '../types/models';

export function getExamHistoryEntry(history: ExamHistoryEntry[], historyId: string) {
  return history.find((item) => item.id === historyId) ?? null;
}

export function buildExamResultDetail(catalog: LearningCatalog, historyEntry: ExamHistoryEntry) {
  return historyEntry.topicBreakdown.map((item) => ({
    ...item,
    topicName: catalog.topics.find((topic) => topic.id === item.topicId)?.name ?? item.topicId,
    topicCode: catalog.topics.find((topic) => topic.id === item.topicId)?.code ?? item.topicId,
  }));
}

export function buildReviewQuestions(catalog: LearningCatalog, reviewItems: ExamReviewItem[]) {
  return reviewItems
    .map((item) => {
      const question = catalog.questions.find((current) => current.id === item.questionId);
      return question ? { question, reviewItem: item } : null;
    })
    .filter((item): item is { question: LearningCatalog['questions'][number]; reviewItem: ExamReviewItem } => Boolean(item));
}
