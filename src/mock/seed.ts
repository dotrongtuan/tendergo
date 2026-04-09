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
  OptionId,
  Question,
  QuestionDifficulty,
  QuestionPerformance,
  Topic,
} from '../types/models';
import { sampleWithoutReplacement, shuffleArray } from '../utils/array';
import importedExamSets from './imported/tenderExamSets.json';
import importedTrainingData from './imported/tenderTrainingData.json';
import { topicBlueprints as fallbackTopicBlueprints } from './topics';

const REFERENCE_NOW = new Date('2026-04-09T08:00:00+07:00');

type ImportedQuestionSeed = {
  question: string;
  options: Record<OptionId, string>;
  correctAnswer: OptionId;
  explanation: string;
  difficulty: QuestionDifficulty;
  tags?: string[];
  source: string;
};

type ImportedLessonSeed = {
  title: string;
  content: string;
  keyPoints: string[];
  quickNotes: string[];
  estimatedStudyTime: number;
  example?: string;
  references?: string[];
  tags?: string[];
};

type ImportedTopicSeed = {
  topicNumber: number;
  sourceFile: string;
  docTitle: string;
  learningObjectives: string[];
  legalReferences: string[];
  summary: string;
  flashSummary: string[];
  lessons: ImportedLessonSeed[];
  questions: ImportedQuestionSeed[];
};

type ImportedExamQuestionSeed = {
  number: number;
  question: string;
  options: Record<OptionId, string>;
  correctAnswer: OptionId;
  explanation: string;
  difficulty: QuestionDifficulty;
  source: string;
};

type ImportedExamSeed = {
  id: string;
  sourceFile: string;
  title: string;
  description: string;
  durationMinutes: number;
  scoringGuide: string[];
  questions: ImportedExamQuestionSeed[];
};

const importedTopicSeeds = (importedTrainingData.topics as ImportedTopicSeed[]).slice().sort((left, right) => {
  return left.topicNumber - right.topicNumber;
});
const importedExamSeeds = (importedExamSets.exams as ImportedExamSeed[]).slice();

function dateAgo(daysAgo: number, hour = 8) {
  const snapshot = new Date(REFERENCE_NOW);
  snapshot.setDate(snapshot.getDate() - daysAgo);
  snapshot.setHours(hour, 0, 0, 0);
  return snapshot.toISOString();
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/đ/g, 'd')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

function slugify(text: string) {
  return normalizeText(text).replace(/\s+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'section';
}

function compactText(text: string, maxLength: number) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

function toTriplet(values: string[], fallback: readonly string[]): [string, string, string] {
  const merged = [...values.filter(Boolean), ...fallback.filter(Boolean)];
  const unique = merged.filter((value, index) => merged.indexOf(value) === index);

  return [
    unique[0] ?? fallback[0] ?? 'Bám sát tài liệu chuyên đề và văn bản pháp lý hiện hành.',
    unique[1] ?? unique[0] ?? fallback[1] ?? 'Đọc kỹ điều kiện áp dụng và chủ thể có thẩm quyền.',
    unique[2] ?? unique[1] ?? fallback[2] ?? 'Kết hợp học lý thuyết với câu hỏi tình huống để ghi nhớ lâu hơn.',
  ];
}

function uniqueStrings(values: string[]) {
  return values.filter((value, index) => value && values.indexOf(value) === index);
}

const fallbackTopicByNumber = new Map(fallbackTopicBlueprints.map((topic) => [topic.order, topic]));

const importedTopicBlueprints = importedTopicSeeds.map((topicSeed) => {
  const fallbackTopic = fallbackTopicByNumber.get(topicSeed.topicNumber);
  if (!fallbackTopic) {
    throw new Error(`Missing fallback topic metadata for topic ${topicSeed.topicNumber}`);
  }

  const lessons =
    topicSeed.lessons.length > 0
      ? topicSeed.lessons.map((lesson, lessonIndex) => {
          const fallbackLesson = fallbackTopic.lessons[lessonIndex % fallbackTopic.lessons.length] ?? fallbackTopic.lessons[0];
          return {
            idSuffix: `${String(lessonIndex + 1).padStart(2, '0')}-${slugify(lesson.title)}`,
            title: lesson.title,
            content: lesson.content,
            keyPoints: toTriplet(lesson.keyPoints, fallbackLesson?.keyPoints ?? []),
            quickNotes: toTriplet(lesson.quickNotes, fallbackLesson?.quickNotes ?? []),
            example: lesson.example ?? fallbackLesson?.example,
            references: uniqueStrings([...(lesson.references ?? []), ...(topicSeed.legalReferences ?? []), `Nguồn: ${topicSeed.sourceFile}`]).slice(0, 5),
            estimatedStudyTime: lesson.estimatedStudyTime || fallbackLesson?.estimatedStudyTime || 18,
          };
        })
      : fallbackTopic.lessons;

  const importedTags = topicSeed.lessons.flatMap((lesson) => lesson.tags ?? []).slice(0, 6);

  return {
    id: fallbackTopic.id,
    code: fallbackTopic.code,
    name: fallbackTopic.name,
    shortDescription: compactText(topicSeed.summary || fallbackTopic.shortDescription, 160),
    learningObjectives: topicSeed.learningObjectives.length ? topicSeed.learningObjectives : fallbackTopic.learningObjectives,
    summary: topicSeed.summary || fallbackTopic.summary,
    flashSummary: topicSeed.flashSummary.length ? topicSeed.flashSummary.slice(0, 3) : fallbackTopic.flashSummary,
    tags: uniqueStrings([...fallbackTopic.tags, ...importedTags]).slice(0, 6),
    order: fallbackTopic.order,
    sourceDocument: {
      fileName: topicSeed.sourceFile,
      documentTitle: topicSeed.docTitle,
      legalReferences: uniqueStrings(topicSeed.legalReferences).slice(0, 8),
      importedNote:
        'Dữ liệu đã được nhập từ tài liệu chuyên đề người dùng cung cấp. Trước khi dùng chính thức, cần đối chiếu văn bản pháp luật hiện hành và rà soát bởi hội đồng chuyên môn.',
    },
    lessons,
  };
});

export const mockProgram = {
  id: 'program-dauthau-chungchi',
  code: PROGRAM_CODE,
  name: 'Chương trình bồi dưỡng ôn thi chứng chỉ nghiệp vụ chuyên môn về đấu thầu',
  description: 'Nền tảng học tập và luyện thi đa nền tảng dành cho học viên ôn thi nghiệp vụ đấu thầu.',
  disclaimer: APP_DISCLAIMER,
};

export const mockLessons: Lesson[] = importedTopicBlueprints.flatMap((topic) =>
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

export const mockTopics: Topic[] = importedTopicBlueprints.map((topic) => ({
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
  sourceDocument: topic.sourceDocument ? { ...topic.sourceDocument, legalReferences: [...topic.sourceDocument.legalReferences] } : undefined,
}));

const topicMap = new Map(mockTopics.map((topic) => [topic.id, topic]));
const lessonsByTopicId = new Map<string, Lesson[]>();
mockLessons.forEach((lesson) => {
  const existing = lessonsByTopicId.get(lesson.topicId) ?? [];
  lessonsByTopicId.set(lesson.topicId, [...existing, lesson]);
});

function tokenize(text: string) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

const topicInferenceCorpus = mockTopics.map((topic) => {
  const lessonsText = (lessonsByTopicId.get(topic.id) ?? [])
    .map((lesson) => `${lesson.title} ${lesson.keyPoints.join(' ')} ${lesson.quickNotes.join(' ')}`)
    .join(' ');

  return {
    topicId: topic.id,
    tokens: new Set(
      tokenize(
        [
          topic.code,
          topic.name,
          topic.shortDescription,
          topic.summary,
          topic.flashSummary.join(' '),
          topic.tags.join(' '),
          lessonsText,
        ].join(' '),
      ),
    ),
  };
});

function inferTopicId(questionText: string) {
  const questionTokens = new Set(tokenize(questionText));
  let bestTopicId = mockTopics[0]?.id ?? 'topic-1';
  let bestScore = -1;

  topicInferenceCorpus.forEach((topic) => {
    let score = 0;
    questionTokens.forEach((token) => {
      if (topic.tokens.has(token)) {
        score += 1;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestTopicId = topic.topicId;
    }
  });

  return bestTopicId;
}

function inferLessonId(questionText: string, topicId: string) {
  const topicLessons = lessonsByTopicId.get(topicId) ?? [];
  if (!topicLessons.length) {
    return undefined;
  }

  const questionTokens = new Set(tokenize(questionText));
  let bestLessonId = topicLessons[0]?.id;
  let bestScore = -1;

  topicLessons.forEach((lesson) => {
    const lessonTokens = new Set(tokenize(`${lesson.title} ${lesson.keyPoints.join(' ')} ${lesson.quickNotes.join(' ')}`));
    let score = 0;
    questionTokens.forEach((token) => {
      if (lessonTokens.has(token)) {
        score += 1;
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestLessonId = lesson.id;
    }
  });

  return bestLessonId;
}

const fallbackQuestionDifficultyCycle: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
const fallbackFocusPool = mockLessons.flatMap((lesson) =>
  [...lesson.keyPoints, ...lesson.quickNotes].map((label) => ({
    label,
    topicId: lesson.topicId,
    lessonId: lesson.id,
  })),
);

function buildFallbackQuestions(topicId: string, topicName: string, lessonTitle: string, count: number): Question[] {
  const topicLessons = lessonsByTopicId.get(topicId) ?? [];
  const sourceLesson = topicLessons.find((lesson) => lesson.title === lessonTitle) ?? topicLessons[0];
  if (!sourceLesson) {
    return [];
  }

  const focusItems = [...sourceLesson.keyPoints, ...sourceLesson.quickNotes].slice(0, count);
  return focusItems.map((focus, index) => {
    const distractors = sampleWithoutReplacement(
      fallbackFocusPool.filter((candidate) => candidate.label !== focus && candidate.lessonId !== sourceLesson.id),
      3,
    ).map((candidate) => candidate.label);
    const labels = shuffleArray([focus, ...distractors]);
    const options = labels.map((label, optionIndex) => ({
      id: OPTION_IDS[optionIndex]!,
      label,
    }));

    return {
      id: `${topicId}-fallback-q${String(index + 1).padStart(2, '0')}`,
      topicId,
      lessonId: sourceLesson.id,
      question: `Theo nội dung "${lessonTitle}" của "${topicName}", nhận định nào phù hợp nhất?`,
      options,
      correctAnswer: options.find((option) => option.label === focus)?.id ?? 'A',
      explanation: `${focus}. ${APP_DISCLAIMER}`,
      difficulty: fallbackQuestionDifficultyCycle[index % fallbackQuestionDifficultyCycle.length] ?? 'medium',
      tags: [topicName, lessonTitle, 'fallback'],
      source: MOCK_SOURCE_LABEL,
    };
  });
}

const importedTopicSeedByNumber = new Map(importedTopicSeeds.map((topic) => [topic.topicNumber, topic]));

const importedQuestions = mockTopics.flatMap((topic) => {
  const topicSeed = importedTopicSeedByNumber.get(topic.order);
  if (!topicSeed) {
    return [];
  }

  const topicQuestions = topicSeed.questions.map((question, index) => ({
    id: `${topic.id}-q${String(index + 1).padStart(2, '0')}`,
    topicId: topic.id,
    lessonId: inferLessonId(question.question, topic.id),
    question: question.question,
    options: OPTION_IDS.map((optionId) => ({
      id: optionId,
      label: question.options[optionId] ?? '',
    })),
    correctAnswer: question.correctAnswer,
    explanation: `${question.explanation} ${APP_DISCLAIMER}`.trim(),
    difficulty: question.difficulty,
    tags: uniqueStrings([topic.code, topic.name, ...(question.tags ?? []), ...topic.tags.slice(0, 2)]).slice(0, 6),
    source: question.source,
  }));

  if (topicQuestions.length >= 15) {
    return topicQuestions;
  }

  const fallbackQuestions = buildFallbackQuestions(
    topic.id,
    topic.name,
    mockLessons.find((lesson) => lesson.topicId === topic.id)?.title ?? topic.name,
    15 - topicQuestions.length,
  );
  return [...topicQuestions, ...fallbackQuestions];
});

const importedExamQuestionGroups = importedExamSeeds.map((examSeed) => {
  const questions = examSeed.questions.map((question, index) => {
    const inferredTopicId = inferTopicId(`${question.question} ${Object.values(question.options).join(' ')}`);
    const topic = topicMap.get(inferredTopicId);

    return {
      id: `exam-source-${examSeed.id}-q${String(index + 1).padStart(2, '0')}`,
      topicId: inferredTopicId,
      lessonId: inferLessonId(question.question, inferredTopicId),
      question: question.question,
      options: OPTION_IDS.map((optionId) => ({
        id: optionId,
        label: question.options[optionId] ?? '',
      })),
      correctAnswer: question.correctAnswer,
      explanation: `${question.explanation} ${APP_DISCLAIMER}`.trim(),
      difficulty: question.difficulty,
      tags: uniqueStrings([
        topic?.code ?? 'Đề tổng quát',
        topic?.name ?? 'Kiến thức chung',
        'đề nguồn',
        examSeed.sourceFile.replace(/\.docx$/i, ''),
        ...((topic?.tags ?? []).slice(0, 2)),
      ]).slice(0, 6),
      source: question.source,
    };
  });

  return { examSeed, questions };
});

const importedExamQuestions = importedExamQuestionGroups.flatMap((group) => group.questions);

export const mockQuestions: Question[] = [...importedQuestions, ...importedExamQuestions];

const comprehensiveTopicIds = mockTopics.map((topic) => topic.id);
const sourceBasedExams: ExamDefinition[] = importedExamQuestionGroups.map(({ examSeed, questions }) => ({
  id: `exam-${examSeed.id}`,
  title: examSeed.title,
  mode: 'comprehensive',
  topicIds: uniqueStrings(questions.map((question) => question.topicId)),
  numberOfQuestions: questions.length,
  durationMinutes: examSeed.durationMinutes,
  questionSelectionStrategy: 'preset',
  passingScore: 75,
  description: examSeed.description,
  presetQuestionIds: questions.map((question) => question.id),
  sourceLabel: 'Đề nguồn từ tài liệu DOCX',
  sourceFile: examSeed.sourceFile,
}));

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
  ...sourceBasedExams,
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
