import type {
  ExamHistoryEntry,
  LearningCatalog,
  LessonProgress,
  QuestionPerformance,
} from '../types/models';
import { buildTopicAnalytics, getCompletionPercentage, getWeakTopics } from '../utils/analytics';

export function buildHomeDashboardData(
  catalog: LearningCatalog,
  lessonProgress: Record<string, LessonProgress>,
  questionPerformance: Record<string, QuestionPerformance>,
  history: ExamHistoryEntry[],
) {
  const analyticsRows = buildTopicAnalytics(
    catalog.topics,
    catalog.lessons,
    catalog.questions,
    questionPerformance,
    lessonProgress,
  );

  const topicProgressById = Object.fromEntries(
    catalog.topics.map((topic) => {
      const completedLessons = topic.lessonIds.filter((lessonId) => lessonProgress[lessonId]?.completed).length;
      const progress = topic.lessonIds.length ? (completedLessons / topic.lessonIds.length) * 100 : 0;
      return [topic.id, progress];
    }),
  );

  return {
    completion: getCompletionPercentage(catalog.lessons, lessonProgress),
    weakTopics: getWeakTopics(analyticsRows, 2),
    recentHistory: history.slice(0, 3),
    featuredTopics: catalog.topics.slice().sort((left, right) => left.order - right.order).slice(0, 3),
    topicProgressById,
  };
}
