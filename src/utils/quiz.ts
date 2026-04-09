import { OPTION_IDS } from '../constants/app';
import type {
  ExamDefinition,
  ExamExperienceMode,
  ExamResult,
  ExamSession,
  ExamSessionQuestion,
  Question,
  TopicBreakdown,
} from '../types/models';
import { sampleWithoutReplacement, shuffleArray } from './array';

interface CreateExamSessionParams {
  exam: ExamDefinition;
  questionPool: Question[];
  experienceMode: ExamExperienceMode;
  questionCount?: number;
  durationMinutes?: number;
  revealAnswersInstantly?: boolean;
  selectedTopicIds?: string[];
}

function takeTopicBalancedQuestions(questions: Question[], topicIds: string[], count: number) {
  const grouped = topicIds.map((topicId) =>
    shuffleArray(questions.filter((question) => question.topicId === topicId)),
  );
  const selected: Question[] = [];
  const base = Math.floor(count / Math.max(1, topicIds.length));
  let remaining = count;

  grouped.forEach((group) => {
    const picked = group.slice(0, Math.min(base, group.length));
    selected.push(...picked);
    remaining -= picked.length;
  });

  const leftovers = shuffleArray(
    grouped.flatMap((group) => group.filter((question) => !selected.some((item) => item.id === question.id))),
  );

  selected.push(...leftovers.slice(0, remaining));

  return selected;
}

function takeLessonBalancedQuestions(questions: Question[], count: number) {
  const grouped = Object.values(
    questions.reduce<Record<string, Question[]>>((accumulator, question) => {
      const key = question.lessonId ?? question.topicId;
      accumulator[key] = accumulator[key] ?? [];
      accumulator[key].push(question);
      return accumulator;
    }, {}),
  ).map((group) => shuffleArray(group));

  const selected: Question[] = [];
  let cursor = 0;

  while (selected.length < count && grouped.some((group) => cursor < group.length)) {
    grouped.forEach((group) => {
      if (selected.length < count && cursor < group.length) {
        selected.push(group[cursor]!);
      }
    });
    cursor += 1;
  }

  return selected;
}

function pickQuestions(exam: ExamDefinition, questionPool: Question[], questionCount: number) {
  const scopedQuestions = questionPool.filter((question) => exam.topicIds.includes(question.topicId));
  const limit = Math.min(questionCount, scopedQuestions.length);

  if (exam.questionSelectionStrategy === 'topic-balanced' && exam.topicIds.length > 1) {
    return takeTopicBalancedQuestions(scopedQuestions, exam.topicIds, limit);
  }

  if (exam.questionSelectionStrategy === 'lesson-balanced') {
    return takeLessonBalancedQuestions(scopedQuestions, limit);
  }

  return sampleWithoutReplacement(scopedQuestions, limit);
}

export function createExamSession({
  exam,
  questionPool,
  experienceMode,
  questionCount,
  durationMinutes,
  revealAnswersInstantly,
}: CreateExamSessionParams): ExamSession {
  const actualQuestionCount = questionCount ?? exam.numberOfQuestions;
  const actualDuration = durationMinutes ?? exam.durationMinutes;
  const items = pickQuestions(exam, questionPool, actualQuestionCount).map<ExamSessionQuestion>((question, index) => ({
    questionId: question.id,
    optionOrder: shuffleArray(OPTION_IDS),
    position: index + 1,
  }));
  const startedAt = new Date().toISOString();
  const expiresAt =
    experienceMode === 'simulation'
      ? new Date(Date.now() + actualDuration * 60 * 1000).toISOString()
      : undefined;

  return {
    id: `session-${Date.now()}`,
    examId: exam.id,
    title: exam.title,
    sourceTopicIds: exam.topicIds,
    catalogMode: exam.mode,
    experienceMode,
    startedAt,
    expiresAt,
    durationMinutes: actualDuration,
    passingScore: exam.passingScore,
    revealAnswersInstantly: revealAnswersInstantly ?? experienceMode === 'practice',
    items,
    currentQuestionIndex: 0,
    answers: Object.fromEntries(items.map((item) => [item.questionId, null])),
    flaggedQuestionIds: [],
  };
}

export function getRemainingSeconds(session: ExamSession) {
  if (!session.expiresAt) {
    return session.durationMinutes * 60;
  }

  return Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
}

export function gradeExamSession(session: ExamSession, questions: Question[]): ExamResult {
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const reviewItems = session.items.map((item) => {
    const question = questionMap.get(item.questionId);

    if (!question) {
      throw new Error(`Missing question for exam item ${item.questionId}`);
    }

    const selectedAnswer = session.answers[item.questionId] ?? null;

    return {
      questionId: item.questionId,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
      optionOrder: item.optionOrder,
    };
  });

  const correctCount = reviewItems.filter((item) => item.isCorrect).length;
  const topicBreakdownMap = new Map<string, TopicBreakdown>();

  reviewItems.forEach((item) => {
    const question = questionMap.get(item.questionId)!;
    const existing = topicBreakdownMap.get(question.topicId) ?? {
      topicId: question.topicId,
      correct: 0,
      total: 0,
    };
    existing.total += 1;
    if (item.isCorrect) {
      existing.correct += 1;
    }
    topicBreakdownMap.set(question.topicId, existing);
  });

  const topicBreakdown = [...topicBreakdownMap.values()];
  const weakTopicIds = [...topicBreakdown]
    .sort(
      (left, right) =>
        left.correct / Math.max(1, left.total) - right.correct / Math.max(1, right.total),
    )
    .slice(0, 3)
    .map((item) => item.topicId);

  const completedAt = new Date().toISOString();
  const elapsedSeconds = Math.min(
    session.durationMinutes * 60,
    Math.floor((new Date(completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000),
  );

  return {
    historyEntry: {
      id: `history-${Date.now()}`,
      examId: session.examId,
      title: session.title,
      catalogMode: session.catalogMode,
      experienceMode: session.experienceMode,
      startedAt: session.startedAt,
      completedAt,
      durationSeconds: elapsedSeconds,
      scorePercentage: Math.round((correctCount / Math.max(1, reviewItems.length)) * 100),
      totalQuestions: reviewItems.length,
      correctCount,
      flaggedCount: session.flaggedQuestionIds.length,
      topicBreakdown,
      questionIds: session.items.map((item) => item.questionId),
      weakTopicIds,
    },
    reviewItems,
  };
}
