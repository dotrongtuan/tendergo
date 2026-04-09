import { ANALYTICS_HEATMAP_DAYS } from '../constants/app';
import type {
  ExamHistoryEntry,
  Lesson,
  LessonProgress,
  Question,
  QuestionPerformance,
  Topic,
} from '../types/models';

export interface TopicAnalyticsRow {
  topicId: string;
  topicName: string;
  answered: number;
  correct: number;
  accuracy: number;
  completedLessons: number;
  totalLessons: number;
}

export interface HeatmapCell {
  date: string;
  label: string;
  value: number;
}

export interface TrendPoint {
  id: string;
  label: string;
  value: number;
}

export function buildTopicAnalytics(
  topics: Topic[],
  lessons: Lesson[],
  questions: Question[],
  questionPerformance: Record<string, QuestionPerformance>,
  lessonProgress: Record<string, LessonProgress>,
) {
  return topics
    .map<TopicAnalyticsRow>((topic) => {
      const topicLessons = lessons.filter((lesson) => lesson.topicId === topic.id);
      const completedLessons = topicLessons.filter((lesson) => lessonProgress[lesson.id]?.completed).length;
      const topicQuestions = questions.filter((question) => question.topicId === topic.id);
      const performances = topicQuestions
        .map((question) => questionPerformance[question.id])
        .filter((item): item is QuestionPerformance => Boolean(item));
      const answered = performances.reduce((total, item) => total + item.totalAttempts, 0);
      const correct = performances.reduce((total, item) => total + item.correctAttempts, 0);
      const accuracy = answered ? (correct / answered) * 100 : 0;

      return {
        topicId: topic.id,
        topicName: topic.name,
        answered,
        correct,
        accuracy,
        completedLessons,
        totalLessons: topicLessons.length,
      };
    })
    .sort((left, right) => left.topicName.localeCompare(right.topicName, 'vi'));
}

export function getCompletionPercentage(lessons: Lesson[], lessonProgress: Record<string, LessonProgress>) {
  if (!lessons.length) {
    return 0;
  }

  const completed = lessons.filter((lesson) => lessonProgress[lesson.id]?.completed).length;
  return (completed / lessons.length) * 100;
}

export function buildStudyHeatmap(history: ExamHistoryEntry[]) {
  const buckets = new Map<string, number>();

  history.forEach((item) => {
    const key = item.completedAt.slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + item.totalQuestions);
  });

  return Array.from({ length: ANALYTICS_HEATMAP_DAYS }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (ANALYTICS_HEATMAP_DAYS - index - 1));
    const iso = date.toISOString().slice(0, 10);

    return {
      date: iso,
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      value: buckets.get(iso) ?? 0,
    } satisfies HeatmapCell;
  });
}

export function buildScoreTrend(history: ExamHistoryEntry[]) {
  return [...history]
    .sort((left, right) => left.completedAt.localeCompare(right.completedAt))
    .slice(-6)
    .map((item) => ({
      id: item.id,
      label: `${new Date(item.completedAt).getDate()}/${new Date(item.completedAt).getMonth() + 1}`,
      value: item.scorePercentage,
    })) satisfies TrendPoint[];
}

export function getWeakTopics(rows: TopicAnalyticsRow[], limit = 3) {
  return [...rows]
    .sort((left, right) => left.accuracy - right.accuracy || left.completedLessons - right.completedLessons)
    .slice(0, limit);
}

export function getStrongTopics(rows: TopicAnalyticsRow[], limit = 3) {
  return [...rows]
    .sort((left, right) => right.accuracy - left.accuracy || right.completedLessons - left.completedLessons)
    .slice(0, limit);
}
