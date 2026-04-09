import type {
  LearningCatalog,
  Question,
  QuestionBankFilters,
  QuestionPerformance,
} from '../types/models';
import { matchesSearch } from '../utils/search';

export function filterQuestionBank(
  catalog: LearningCatalog,
  filters: QuestionBankFilters,
  questionPerformance: Record<string, QuestionPerformance>,
  bookmarkedQuestionIds: string[],
) {
  return catalog.questions.filter((question) => {
    const attempted = questionPerformance[question.id]?.totalAttempts ?? 0;
    const wasCorrect = questionPerformance[question.id]?.lastAnsweredCorrectly ?? null;
    const matchesStatus =
      filters.status === 'all'
        ? true
        : filters.status === 'unanswered'
          ? attempted === 0
          : filters.status === 'incorrect'
            ? attempted > 0 && wasCorrect === false
            : bookmarkedQuestionIds.includes(question.id);

    return (
      (!filters.topicId || question.topicId === filters.topicId) &&
      (filters.difficulty === 'all' || question.difficulty === filters.difficulty) &&
      matchesStatus &&
      (!filters.bookmarkedOnly || bookmarkedQuestionIds.includes(question.id)) &&
      matchesSearch([question.question, ...question.tags], filters.searchText)
    );
  });
}

export function getQuestionById(catalog: LearningCatalog, questionId: string) {
  return catalog.questions.find((question) => question.id === questionId) ?? null;
}
