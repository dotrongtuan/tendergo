import { z } from 'zod';

import type { AuthMode } from './models';

export const authFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập ít nhất 2 ký tự.')
    .max(40, 'Tên hiển thị tối đa 40 ký tự.'),
  learningGoal: z
    .string()
    .trim()
    .min(10, 'Hãy mô tả mục tiêu học tập ngắn gọn.')
    .max(160, 'Mục tiêu học tập tối đa 160 ký tự.'),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;

export const questionFilterSchema = z.object({
  topicId: z.string().optional(),
  difficulty: z.enum(['all', 'easy', 'medium', 'hard']),
  status: z.enum(['all', 'unanswered', 'incorrect', 'bookmarked']),
  bookmarkedOnly: z.boolean(),
  searchText: z.string().trim().max(80),
});

export type QuestionFilterFormValues = z.infer<typeof questionFilterSchema>;

const topicBreakdownSchema = z.object({
  topicId: z.string(),
  correct: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

const examHistorySchema = z.object({
  id: z.string(),
  examId: z.string(),
  title: z.string(),
  catalogMode: z.enum(['topic', 'comprehensive']),
  experienceMode: z.enum(['practice', 'simulation']),
  startedAt: z.string(),
  completedAt: z.string(),
  durationSeconds: z.number().nonnegative(),
  scorePercentage: z.number().nonnegative().max(100),
  totalQuestions: z.number().nonnegative(),
  correctCount: z.number().nonnegative(),
  flaggedCount: z.number().nonnegative(),
  topicBreakdown: z.array(topicBreakdownSchema),
  questionIds: z.array(z.string()),
  weakTopicIds: z.array(z.string()),
});

const lessonProgressSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean(),
  lastReadAt: z.string().optional(),
  totalMinutesSpent: z.number().nonnegative(),
});

const questionPerformanceSchema = z.object({
  questionId: z.string(),
  totalAttempts: z.number().nonnegative(),
  correctAttempts: z.number().nonnegative(),
  lastAnsweredCorrectly: z.boolean().nullable(),
  lastAnsweredAt: z.string().optional(),
});

const authModeSchema: z.ZodType<AuthMode> = z.union([z.literal('guest'), z.literal('mock'), z.null()]);

export const snapshotSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  profile: z.object({
    id: z.string(),
    displayName: z.string(),
    roleLabel: z.string(),
    learningGoal: z.string(),
    dailyStudyMinutes: z.number().nonnegative(),
    targetExamDate: z.string().optional(),
    streakDays: z.number().nonnegative(),
    joinedAt: z.string(),
  }),
  preferences: z.object({
    themeMode: z.enum(['light', 'dark', 'system']),
    hasCompletedOnboarding: z.boolean(),
    authMode: authModeSchema,
    examDefaults: z.object({
      experienceMode: z.enum(['practice', 'simulation']),
      revealAnswersInstantly: z.boolean(),
      defaultQuestionCount: z.number().positive(),
      defaultDurationMinutes: z.number().positive(),
    }),
    remindersEnabled: z.boolean(),
  }),
  bookmarks: z.object({
    lessonIds: z.array(z.string()),
    questionIds: z.array(z.string()),
  }),
  lessonProgress: z.record(z.string(), lessonProgressSchema),
  questionPerformance: z.record(z.string(), questionPerformanceSchema),
  history: z.array(examHistorySchema),
});

export type SnapshotPayload = z.infer<typeof snapshotSchema>;
