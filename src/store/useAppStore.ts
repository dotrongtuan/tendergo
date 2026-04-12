import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_QUESTION_BANK_FILTERS, SNAPSHOT_VERSION } from '../constants/app';
import {
  mockBookmarks,
  mockHistory,
  mockLessonProgress,
  mockPreferences,
  mockProfile,
  mockQuestionPerformance,
  seededRecentSearches,
} from '../mock/seed';
import type {
  AppSnapshot,
  DataTransferRecord,
  ExamResult,
  ExamReviewItem,
  ExamSession,
  LearnerProfile,
  LessonProgress,
  OptionId,
  QuestionBankFilters,
  QuestionPerformance,
  ThemeModePreference,
} from '../types/models';
import { clamp, unique } from '../utils/array';

interface AppStoreState {
  hasHydrated: boolean;
  preferences: typeof mockPreferences;
  profile: LearnerProfile;
  bookmarks: typeof mockBookmarks;
  lessonProgress: Record<string, LessonProgress>;
  questionPerformance: Record<string, QuestionPerformance>;
  history: typeof mockHistory;
  reviewMap: Record<string, ExamReviewItem[]>;
  activeSession: ExamSession | null;
  questionBankFilters: QuestionBankFilters;
  recentSearches: string[];
  transferHistory: DataTransferRecord[];
  setHasHydrated: (value: boolean) => void;
  completeOnboarding: () => void;
  startGuestMode: () => void;
  startMockLogin: (payload: { displayName: string; learningGoal: string }) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<LearnerProfile>) => void;
  updateThemeMode: (mode: ThemeModePreference) => void;
  setRemindersEnabled: (value: boolean) => void;
  setExamDefaults: (patch: Partial<AppStoreState['preferences']['examDefaults']>) => void;
  toggleLessonBookmark: (lessonId: string) => void;
  toggleQuestionBookmark: (questionId: string) => void;
  markLessonVisited: (lessonId: string, minutesSpent?: number) => void;
  markLessonCompleted: (lessonId: string) => void;
  updateQuestionBankFilters: (patch: Partial<QuestionBankFilters>) => void;
  resetQuestionBankFilters: () => void;
  saveSearchTerm: (term: string) => void;
  recordQuestionAttempt: (questionId: string, isCorrect: boolean) => void;
  startExamSession: (session: ExamSession) => void;
  answerQuestion: (questionId: string, answer: OptionId) => void;
  goToQuestionIndex: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  toggleQuestionFlag: (questionId: string) => void;
  submitActiveSession: (result: ExamResult) => void;
  abandonActiveSession: () => void;
  buildSnapshot: () => AppSnapshot;
  importSnapshot: (snapshot: AppSnapshot) => void;
  recordTransfer: (record: Omit<DataTransferRecord, 'id' | 'createdAt'>) => void;
  resetLearnerProgress: () => void;
  resetToSeed: () => void;
}

function buildInitialPersistedState() {
  return {
    preferences: { ...mockPreferences, examDefaults: { ...mockPreferences.examDefaults } },
    profile: { ...mockProfile },
    bookmarks: { lessonIds: [...mockBookmarks.lessonIds], questionIds: [...mockBookmarks.questionIds] },
    lessonProgress: { ...mockLessonProgress },
    questionPerformance: { ...mockQuestionPerformance },
    history: [...mockHistory],
    reviewMap: {} as Record<string, ExamReviewItem[]>,
    activeSession: null as ExamSession | null,
    questionBankFilters: { ...DEFAULT_QUESTION_BANK_FILTERS },
    recentSearches: [...seededRecentSearches],
    transferHistory: [] as DataTransferRecord[],
  };
}

function buildFreshLearnerState(
  profile: LearnerProfile,
  preferences: typeof mockPreferences,
) {
  return {
    preferences: {
      ...preferences,
      hasCompletedOnboarding: false,
      authMode: null,
    },
    profile: {
      ...profile,
      displayName: '',
      roleLabel: 'Chưa thiết lập',
      learningGoal: '',
      streakDays: 0,
      joinedAt: new Date().toISOString(),
      targetExamDate: undefined,
    },
    bookmarks: { lessonIds: [], questionIds: [] },
    lessonProgress: {} as Record<string, LessonProgress>,
    questionPerformance: {} as Record<string, QuestionPerformance>,
    history: [] as typeof mockHistory,
    reviewMap: {} as Record<string, ExamReviewItem[]>,
    activeSession: null as ExamSession | null,
    questionBankFilters: { ...DEFAULT_QUESTION_BANK_FILTERS },
    recentSearches: [] as string[],
    transferHistory: [] as DataTransferRecord[],
  };
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      ...buildInitialPersistedState(),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      completeOnboarding: () =>
        set((state) => ({ preferences: { ...state.preferences, hasCompletedOnboarding: true } })),
      startGuestMode: () =>
        set((state) => ({
          preferences: { ...state.preferences, authMode: 'guest', hasCompletedOnboarding: true },
          profile: {
            ...state.profile,
            displayName: state.profile.displayName.trim() || 'Khách học thử',
            learningGoal: state.profile.learningGoal.trim() || mockProfile.learningGoal,
            roleLabel: 'Khách học thử',
          },
        })),
      startMockLogin: ({ displayName, learningGoal }) =>
        set((state) => ({
          preferences: { ...state.preferences, authMode: 'mock', hasCompletedOnboarding: true },
          profile: { ...state.profile, displayName, learningGoal, roleLabel: 'Học viên mô phỏng' },
        })),
      signOut: () =>
        set((state) => ({
          preferences: { ...state.preferences, authMode: null },
          activeSession: null,
        })),
      updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      updateThemeMode: (mode) => set((state) => ({ preferences: { ...state.preferences, themeMode: mode } })),
      setRemindersEnabled: (value) =>
        set((state) => ({ preferences: { ...state.preferences, remindersEnabled: value } })),
      setExamDefaults: (patch) =>
        set((state) => ({
          preferences: { ...state.preferences, examDefaults: { ...state.preferences.examDefaults, ...patch } },
        })),
      toggleLessonBookmark: (lessonId) =>
        set((state) => ({
          bookmarks: {
            ...state.bookmarks,
            lessonIds: state.bookmarks.lessonIds.includes(lessonId)
              ? state.bookmarks.lessonIds.filter((item) => item !== lessonId)
              : [lessonId, ...state.bookmarks.lessonIds],
          },
        })),
      toggleQuestionBookmark: (questionId) =>
        set((state) => ({
          bookmarks: {
            ...state.bookmarks,
            questionIds: state.bookmarks.questionIds.includes(questionId)
              ? state.bookmarks.questionIds.filter((item) => item !== questionId)
              : [questionId, ...state.bookmarks.questionIds],
          },
        })),
      markLessonVisited: (lessonId, minutesSpent = 4) =>
        set((state) => {
          const previous = state.lessonProgress[lessonId];

          return {
            lessonProgress: {
              ...state.lessonProgress,
              [lessonId]: {
                lessonId,
                completed: previous?.completed ?? false,
                lastReadAt: new Date().toISOString(),
                totalMinutesSpent: (previous?.totalMinutesSpent ?? 0) + minutesSpent,
              },
            },
          };
        }),
      markLessonCompleted: (lessonId) =>
        set((state) => {
          const previous = state.lessonProgress[lessonId];

          return {
            lessonProgress: {
              ...state.lessonProgress,
              [lessonId]: {
                lessonId,
                completed: true,
                lastReadAt: new Date().toISOString(),
                totalMinutesSpent: Math.max(previous?.totalMinutesSpent ?? 0, 10),
              },
            },
          };
        }),
      updateQuestionBankFilters: (patch) =>
        set((state) => ({ questionBankFilters: { ...state.questionBankFilters, ...patch } })),
      resetQuestionBankFilters: () => set({ questionBankFilters: { ...DEFAULT_QUESTION_BANK_FILTERS } }),
      saveSearchTerm: (term) => {
        const trimmed = term.trim();
        if (trimmed.length < 2) {
          return;
        }

        set((state) => ({ recentSearches: unique([trimmed, ...state.recentSearches]).slice(0, 8) }));
      },
      recordQuestionAttempt: (questionId, isCorrect) =>
        set((state) => {
          const previous = state.questionPerformance[questionId];

          return {
            questionPerformance: {
              ...state.questionPerformance,
              [questionId]: {
                questionId,
                totalAttempts: (previous?.totalAttempts ?? 0) + 1,
                correctAttempts: (previous?.correctAttempts ?? 0) + (isCorrect ? 1 : 0),
                lastAnsweredCorrectly: isCorrect,
                lastAnsweredAt: new Date().toISOString(),
              },
            },
          };
        }),
      startExamSession: (session) => set({ activeSession: session }),
      answerQuestion: (questionId, answer) =>
        set((state) =>
          state.activeSession
            ? {
                activeSession: {
                  ...state.activeSession,
                  answers: { ...state.activeSession.answers, [questionId]: answer },
                },
              }
            : state,
        ),
      goToQuestionIndex: (index) =>
        set((state) =>
          state.activeSession
            ? {
                activeSession: {
                  ...state.activeSession,
                  currentQuestionIndex: clamp(index, 0, state.activeSession.items.length - 1),
                },
              }
            : state,
        ),
      nextQuestion: () =>
        set((state) =>
          state.activeSession
            ? {
                activeSession: {
                  ...state.activeSession,
                  currentQuestionIndex: clamp(
                    state.activeSession.currentQuestionIndex + 1,
                    0,
                    state.activeSession.items.length - 1,
                  ),
                },
              }
            : state,
        ),
      previousQuestion: () =>
        set((state) =>
          state.activeSession
            ? {
                activeSession: {
                  ...state.activeSession,
                  currentQuestionIndex: clamp(
                    state.activeSession.currentQuestionIndex - 1,
                    0,
                    state.activeSession.items.length - 1,
                  ),
                },
              }
            : state,
        ),
      toggleQuestionFlag: (questionId) =>
        set((state) =>
          state.activeSession
            ? {
                activeSession: {
                  ...state.activeSession,
                  flaggedQuestionIds: state.activeSession.flaggedQuestionIds.includes(questionId)
                    ? state.activeSession.flaggedQuestionIds.filter((item) => item !== questionId)
                    : [...state.activeSession.flaggedQuestionIds, questionId],
                },
              }
            : state,
        ),
      submitActiveSession: (result) =>
        set((state) => {
          const questionPerformance = { ...state.questionPerformance };

          result.reviewItems.forEach((item) => {
            const previous = questionPerformance[item.questionId];
            questionPerformance[item.questionId] = {
              questionId: item.questionId,
              totalAttempts: (previous?.totalAttempts ?? 0) + 1,
              correctAttempts: (previous?.correctAttempts ?? 0) + (item.isCorrect ? 1 : 0),
              lastAnsweredCorrectly: item.isCorrect,
              lastAnsweredAt: result.historyEntry.completedAt,
            };
          });

          return {
            history: [result.historyEntry, ...state.history].slice(0, 30),
            reviewMap: { ...state.reviewMap, [result.historyEntry.id]: result.reviewItems },
            questionPerformance,
            activeSession: null,
          };
        }),
      abandonActiveSession: () => set({ activeSession: null }),
      buildSnapshot: () => {
        const state = get();

        return {
          version: SNAPSHOT_VERSION,
          exportedAt: new Date().toISOString(),
          profile: state.profile,
          preferences: state.preferences,
          bookmarks: state.bookmarks,
          lessonProgress: state.lessonProgress,
          questionPerformance: state.questionPerformance,
          history: state.history,
        };
      },
      importSnapshot: (snapshot) =>
        set((state) => ({
          preferences: {
            ...snapshot.preferences,
            hasCompletedOnboarding: true,
            authMode: state.preferences.authMode ?? snapshot.preferences.authMode ?? 'guest',
          },
          profile: { ...snapshot.profile },
          bookmarks: {
            lessonIds: [...snapshot.bookmarks.lessonIds],
            questionIds: [...snapshot.bookmarks.questionIds],
          },
          lessonProgress: { ...snapshot.lessonProgress },
          questionPerformance: { ...snapshot.questionPerformance },
          history: [...snapshot.history],
          reviewMap: {},
          activeSession: null,
        })),
      recordTransfer: (record) =>
        set((state) => ({
          transferHistory: [
            {
              id: `transfer-${Date.now()}`,
              createdAt: new Date().toISOString(),
              ...record,
            },
            ...state.transferHistory,
          ].slice(0, 20),
        })),
      resetLearnerProgress: () =>
        set((state) => ({
          ...buildFreshLearnerState(state.profile, state.preferences),
        })),
      resetToSeed: () =>
        set((state) => ({
          ...buildInitialPersistedState(),
          preferences: {
            ...mockPreferences,
            hasCompletedOnboarding: true,
            authMode: state.preferences.authMode ?? 'guest',
          },
        })),
    }),
    {
      name: 'tendergo/app-state/v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        profile: state.profile,
        bookmarks: state.bookmarks,
        lessonProgress: state.lessonProgress,
        questionPerformance: state.questionPerformance,
        history: state.history,
        reviewMap: state.reviewMap,
        activeSession: state.activeSession,
        questionBankFilters: state.questionBankFilters,
        recentSearches: state.recentSearches,
        transferHistory: state.transferHistory,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
