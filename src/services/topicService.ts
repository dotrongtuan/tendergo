import type { LearningCatalog, LessonProgress } from '../types/models';

export function buildTopicDetailData(
  catalog: LearningCatalog,
  topicId: string,
  lessonProgress: Record<string, LessonProgress>,
) {
  const topic = catalog.topics.find((item) => item.id === topicId);

  if (!topic) {
    return null;
  }

  const lessons = catalog.lessons
    .filter((lesson) => lesson.topicId === topicId)
    .map((lesson) => ({
      ...lesson,
      isCompleted: lessonProgress[lesson.id]?.completed ?? false,
    }));

  const completedLessons = lessons.filter((lesson) => lesson.isCompleted).length;
  const questionCount = catalog.questions.filter((question) => question.topicId === topicId).length;

  return {
    topic,
    lessons,
    questionCount,
    progress: lessons.length ? (completedLessons / lessons.length) * 100 : 0,
  };
}
