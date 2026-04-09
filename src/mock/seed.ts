import {
  APP_DISCLAIMER,
  DEFAULT_EXAM_CONFIG,
  MOCK_SOURCE_LABEL,
  OPTION_IDS,
  PROGRAM_CODE,
} from '../constants/app';
import type {
  AppPreferences,
  BookmarkState,
  ExamDefinition,
  ExamHistoryEntry,
  LearnerProfile,
  LearningCatalog,
  Lesson,
  LessonProgress,
  Question,
  QuestionDifficulty,
  QuestionPerformance,
  Topic,
} from '../types/models';
import { sampleWithoutReplacement, shuffleArray } from '../utils/array';
import { topicBlueprints } from './topics';

const REFERENCE_NOW = new Date('2026-04-09T08:00:00+07:00');

function dateAgo(daysAgo: number, hour = 8) {
  const snapshot = new Date(REFERENCE_NOW);
  snapshot.setDate(snapshot.getDate() - daysAgo);
  snapshot.setHours(hour, 0, 0, 0);
  return snapshot.toISOString();
}

export const mockProgram = {
  id: 'program-dauthau-chungchi',
  code: PROGRAM_CODE,
  name: 'Chương trình bồi dưỡng ôn thi chứng chỉ nghiệp vụ chuyên môn về đấu thầu',
  description: 'Nền tảng học tập và luyện thi đa nền tảng dành cho học viên ôn thi nghiệp vụ đấu thầu.',
  disclaimer: APP_DISCLAIMER,
};

export const mockLessons: Lesson[] = topicBlueprints.flatMap((topic) =>
  topic.lessons.map((lesson) => ({
    id: `${topic.id}-${lesson.idSuffix}`,
    topicId: topic.id,
    title: lesson.title,
    content: lesson.content,
    keyPoints: [...lesson.keyPoints],
    quickNotes: [...lesson.quickNotes],
    example: lesson.example,
    references: [...lesson.references],
    estimatedStudyTime: lesson.estimatedStudyTime,
  })),
);

export const mockTopics: Topic[] = topicBlueprints.map((topic) => ({
  id: topic.id,
  code: topic.code,
  name: topic.name,
  shortDescription: topic.shortDescription,
  learningObjectives: [...topic.learningObjectives],
  lessonIds: topic.lessons.map((lesson) => `${topic.id}-${lesson.idSuffix}`),
  summary: topic.summary,
  flashSummary: [...topic.flashSummary],
  tags: [...topic.tags],
  order: topic.order,
  estimatedStudyTime: topic.lessons.reduce((total, lesson) => total + lesson.estimatedStudyTime, 0),
}));

const topicMap = new Map(mockTopics.map((topic) => [topic.id, topic]));
const difficultyCycle: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
const questionTemplates = [
  (topicName: string, lessonTitle: string) =>
    `Trong chuyên đề "${topicName}", nhận định nào phù hợp nhất với nội dung "${lessonTitle}"?`,
  (topicName: string, lessonTitle: string) =>
    `Khi ôn "${lessonTitle}" thuộc "${topicName}", phương án nào nên được ghi nhớ trước?`,
  (topicName: string, lessonTitle: string) =>
    `Theo bộ dữ liệu mẫu của "${topicName}", đâu là ý quan trọng gắn với "${lessonTitle}"?`,
  (_topicName: string, lessonTitle: string) =>
    `Nếu gặp câu hỏi tình huống về "${lessonTitle}", nhận định nào dưới đây là phù hợp nhất?`,
];

const focusPool = mockLessons.flatMap((lesson) =>
  [...lesson.keyPoints, ...lesson.quickNotes].map((label) => ({
    label,
    topicId: lesson.topicId,
    lessonId: lesson.id,
  })),
);

export const mockQuestions: Question[] = mockLessons.flatMap((lesson, lessonIndex) => {
  const topic = topicMap.get(lesson.topicId);

  if (!topic) {
    throw new Error(`Missing topic for lesson ${lesson.id}`);
  }

  return [...lesson.keyPoints, ...lesson.quickNotes].map((focus, focusIndex) => {
    const distractors = sampleWithoutReplacement(
      focusPool.filter((candidate) => candidate.label !== focus && candidate.lessonId !== lesson.id),
      3,
    ).map((candidate) => candidate.label);
    const labels = shuffleArray([focus, ...distractors]);
    const options = labels.map((label, optionIndex) => ({
      id: OPTION_IDS[optionIndex]!,
      label,
    }));

    const questionTemplate =
      questionTemplates[(lessonIndex + focusIndex) % questionTemplates.length] ?? questionTemplates[0]!;

    return {
      id: `${lesson.id}-q${String(focusIndex + 1).padStart(2, '0')}`,
      topicId: lesson.topicId,
      lessonId: lesson.id,
      question: questionTemplate(topic.name, lesson.title),
      options,
      correctAnswer: options.find((option) => option.label === focus)?.id ?? 'A',
      explanation: `${focus} là một ý trọng tâm của "${lesson.title}". ${APP_DISCLAIMER}`,
      difficulty: difficultyCycle[(lessonIndex + focusIndex) % difficultyCycle.length]!,
      tags: [topic.code, lesson.title, ...topic.tags.slice(0, 2)],
      source: MOCK_SOURCE_LABEL,
    };
  });
});

const comprehensiveTopicIds = mockTopics.map((topic) => topic.id);

export const mockExams: ExamDefinition[] = [
  ...mockTopics.map((topic) => ({
    id: `exam-${topic.id}`,
    title: `Thi thử ${topic.code}: ${topic.name}`,
    mode: 'topic' as const,
    topicIds: [topic.id],
    numberOfQuestions: 18,
    durationMinutes: 25,
    questionSelectionStrategy: 'random' as const,
    passingScore: 75,
    description: `Đề thi thử theo chuyên đề ${topic.code} dùng để luyện nhanh trước khi làm đề tổng hợp.`,
  })),
  {
    id: 'exam-comprehensive-01',
    title: 'Thi thử tổng hợp toàn bộ chương trình',
    mode: 'comprehensive',
    topicIds: comprehensiveTopicIds,
    numberOfQuestions: 50,
    durationMinutes: 60,
    questionSelectionStrategy: 'topic-balanced',
    passingScore: 80,
    description: 'Đề thi tổng hợp cân bằng câu hỏi giữa các chuyên đề hiện có.',
  },
];

export const learningCatalog: LearningCatalog = {
  program: mockProgram,
  topics: mockTopics,
  lessons: mockLessons,
  questions: mockQuestions,
  exams: mockExams,
};

export const mockProfile: LearnerProfile = {
  id: 'learner-001',
  displayName: 'Học viên mẫu',
  roleLabel: 'Khách học thử',
  learningGoal: 'Hoàn thành toàn bộ chuyên đề và đạt tối thiểu 80% ở đề tổng hợp.',
  dailyStudyMinutes: 45,
  targetExamDate: '2026-06-15',
  streakDays: 6,
  joinedAt: dateAgo(21),
};

export const mockPreferences: AppPreferences = {
  themeMode: 'system',
  hasCompletedOnboarding: false,
  authMode: null,
  examDefaults: {
    experienceMode: 'practice',
    revealAnswersInstantly: DEFAULT_EXAM_CONFIG.revealAnswersInstantly,
    defaultQuestionCount: DEFAULT_EXAM_CONFIG.defaultQuestionCount,
    defaultDurationMinutes: DEFAULT_EXAM_CONFIG.defaultDurationMinutes,
  },
  remindersEnabled: true,
};

export const mockBookmarks: BookmarkState = {
  lessonIds: [mockLessons[0]!.id, mockLessons[5]!.id, mockLessons[14]!.id],
  questionIds: [mockQuestions[2]!.id, mockQuestions[19]!.id, mockQuestions[42]!.id, mockQuestions[88]!.id],
};

export const mockLessonProgress: Record<string, LessonProgress> = Object.fromEntries(
  mockLessons.slice(0, 10).map((lesson, index) => [
    lesson.id,
    {
      lessonId: lesson.id,
      completed: index < 6,
      lastReadAt: dateAgo(10 - index, 19),
      totalMinutesSpent: lesson.estimatedStudyTime - (index % 3 === 0 ? 0 : 4),
    },
  ]),
);

const seededPerformanceQuestions = mockTopics.flatMap((topic) =>
  mockQuestions.filter((question) => question.topicId === topic.id).slice(0, 8),
);

export const mockQuestionPerformance: Record<string, QuestionPerformance> = Object.fromEntries(
  seededPerformanceQuestions.map((question, index) => {
    const totalAttempts = 1 + (index % 3);
    const correctAttempts = Math.max(0, totalAttempts - (index % 4 === 0 ? 1 : 0));
    return [
      question.id,
      {
        questionId: question.id,
        totalAttempts,
        correctAttempts,
        lastAnsweredCorrectly: correctAttempts === totalAttempts,
        lastAnsweredAt: dateAgo((index % 7) + 1, 20),
      },
    ];
  }),
);

function pickQuestionIds(topicIds: string[], count: number) {
  return mockQuestions
    .filter((question) => topicIds.includes(question.topicId))
    .slice(0, count)
    .map((question) => question.id);
}

export const mockHistory: ExamHistoryEntry[] = [
  {
    id: 'history-demo-01',
    examId: 'exam-topic-1',
    title: 'Luyện nhanh chuyên đề 1',
    catalogMode: 'topic',
    experienceMode: 'practice',
    startedAt: dateAgo(12, 19),
    completedAt: dateAgo(12, 20),
    durationSeconds: 18 * 60,
    scorePercentage: 78,
    totalQuestions: 18,
    correctCount: 14,
    flaggedCount: 2,
    topicBreakdown: [{ topicId: 'topic-1', correct: 14, total: 18 }],
    questionIds: pickQuestionIds(['topic-1'], 18),
    weakTopicIds: ['topic-1'],
  },
  {
    id: 'history-demo-02',
    examId: 'exam-topic-3',
    title: 'Mô phỏng chuyên đề 3',
    catalogMode: 'topic',
    experienceMode: 'simulation',
    startedAt: dateAgo(9, 19),
    completedAt: dateAgo(9, 20),
    durationSeconds: 24 * 60,
    scorePercentage: 67,
    totalQuestions: 18,
    correctCount: 12,
    flaggedCount: 4,
    topicBreakdown: [{ topicId: 'topic-3', correct: 12, total: 18 }],
    questionIds: pickQuestionIds(['topic-3'], 18),
    weakTopicIds: ['topic-3'],
  },
  {
    id: 'history-demo-03',
    examId: 'exam-topic-6',
    title: 'Luyện chuyên đề 6',
    catalogMode: 'topic',
    experienceMode: 'practice',
    startedAt: dateAgo(6, 7),
    completedAt: dateAgo(6, 8),
    durationSeconds: 16 * 60,
    scorePercentage: 83,
    totalQuestions: 18,
    correctCount: 15,
    flaggedCount: 1,
    topicBreakdown: [{ topicId: 'topic-6', correct: 15, total: 18 }],
    questionIds: pickQuestionIds(['topic-6'], 18),
    weakTopicIds: ['topic-6'],
  },
  {
    id: 'history-demo-04',
    examId: 'exam-comprehensive-01',
    title: 'Thi thử tổng hợp toàn bộ chương trình',
    catalogMode: 'comprehensive',
    experienceMode: 'simulation',
    startedAt: dateAgo(2, 8),
    completedAt: dateAgo(2, 9),
    durationSeconds: 55 * 60,
    scorePercentage: 69,
    totalQuestions: 45,
    correctCount: 31,
    flaggedCount: 5,
    topicBreakdown: [
      { topicId: 'topic-1', correct: 4, total: 5 },
      { topicId: 'topic-2', correct: 4, total: 5 },
      { topicId: 'topic-3', correct: 3, total: 5 },
      { topicId: 'topic-4', correct: 4, total: 5 },
      { topicId: 'topic-5', correct: 3, total: 5 },
      { topicId: 'topic-6', correct: 4, total: 5 },
      { topicId: 'topic-7', correct: 3, total: 5 },
      { topicId: 'topic-8', correct: 3, total: 5 },
      { topicId: 'topic-10', correct: 3, total: 5 },
    ],
    questionIds: pickQuestionIds(comprehensiveTopicIds, 45),
    weakTopicIds: ['topic-3', 'topic-5', 'topic-10'],
  },
];

export const seededRecentSearches = ['đấu thầu qua mạng', 'tư cách hợp lệ', 'thỏa thuận khung'];
