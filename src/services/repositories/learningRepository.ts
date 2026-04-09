import { learningCatalog } from '../../mock/seed';
import type { LearningCatalog, SearchResult } from '../../types/models';
import { matchesSearch } from '../../utils/search';

export interface LearningRepository {
  getCatalog(): Promise<LearningCatalog>;
  searchCatalog(query: string): Promise<SearchResult[]>;
}

async function withLatency<T>(value: T, timeout = 120) {
  await new Promise((resolve) => setTimeout(resolve, timeout));
  return value;
}

class MockLearningRepository implements LearningRepository {
  async getCatalog() {
    return withLatency<LearningCatalog>(learningCatalog);
  }

  async searchCatalog(query: string) {
    const results: SearchResult[] = [];

    if (!query.trim()) {
      return withLatency(results);
    }

    learningCatalog.topics.forEach((topic) => {
      if (matchesSearch([topic.name, topic.shortDescription, ...topic.tags], query)) {
        results.push({
          id: `search-topic-${topic.id}`,
          kind: 'topic',
          title: topic.name,
          subtitle: topic.shortDescription,
          topicId: topic.id,
          tags: topic.tags,
        });
      }
    });

    learningCatalog.lessons.forEach((lesson) => {
      if (matchesSearch([lesson.title, lesson.content, ...lesson.keyPoints, ...lesson.quickNotes], query)) {
        results.push({
          id: `search-lesson-${lesson.id}`,
          kind: 'lesson',
          title: lesson.title,
          subtitle: lesson.keyPoints[0] ?? '',
          topicId: lesson.topicId,
          lessonId: lesson.id,
          tags: [...lesson.keyPoints.slice(0, 2), lesson.quickNotes[0] ?? ''],
        });
      }
    });

    learningCatalog.questions.forEach((question) => {
      if (
        matchesSearch(
          [question.question, ...question.options.map((option) => option.label), ...question.tags],
          query,
        )
      ) {
        results.push({
          id: `search-question-${question.id}`,
          kind: 'question',
          title: question.question,
          subtitle: question.explanation,
          topicId: question.topicId,
          lessonId: question.lessonId,
          questionId: question.id,
          tags: question.tags,
        });
      }
    });

    return withLatency(results.slice(0, 30));
  }
}

export const learningRepository: LearningRepository = new MockLearningRepository();
