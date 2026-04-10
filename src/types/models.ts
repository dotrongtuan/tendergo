export type ThemeModePreference = 'light' | 'dark' | 'system';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatusFilter = 'all' | 'unanswered' | 'incorrect' | 'bookmarked';
export type ExamCatalogMode = 'topic' | 'comprehensive';
export type ExamExperienceMode = 'practice' | 'simulation';
export type QuestionSelectionStrategy = 'random' | 'topic-balanced' | 'lesson-balanced' | 'preset';
export type OptionId = 'A' | 'B' | 'C' | 'D';
export type AuthMode = 'guest' | 'mock' | null;
export type DataTransferKind =
  | 'import_snapshot'
  | 'export_snapshot'
  | 'export_question_bank_csv'
  | 'export_exam_history_csv'
  | 'export_topic_catalog_csv'
  | 'export_admin_report_pdf';
export type DataTransferStatus = 'success' | 'canceled' | 'error';

export interface Program {
  id: string;
  code: string;
  name: string;
  description: string;
  disclaimer: string;
}

export interface TopicSourceDocument {
  fileName: string;
  documentTitle: string;
  legalReferences: string[];
  importedNote?: string;
}

export interface Topic {
  id: string;
  code: string;
  name: string;
  shortDescription: string;
  learningObjectives: string[];
  lessonIds: string[];
  summary: string;
  flashSummary: string[];
  tags: string[];
  order: number;
  estimatedStudyTime: number;
  sourceDocument?: TopicSourceDocument;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  content: string;
  keyPoints: string[];
  quickNotes: string[];
  example?: string;
  references: string[];
  estimatedStudyTime: number;
}

export interface QuestionOption {
  id: OptionId;
  label: string;
}

export interface QuestionStats {
  totalAttempts: number;
  correctAttempts: number;
}

export interface Question {
  id: string;
  topicId: string;
  lessonId?: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: OptionId;
  explanation: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  source: string;
  stats?: QuestionStats;
}

export interface ExamDefinition {
  id: string;
  title: string;
  mode: ExamCatalogMode;
  topicIds: string[];
  numberOfQuestions: number;
  durationMinutes: number;
  questionSelectionStrategy: QuestionSelectionStrategy;
  passingScore: number;
  description: string;
  presetQuestionIds?: string[];
  sourceLabel?: string;
  sourceFile?: string;
}

export interface TopicBreakdown {
  topicId: string;
  correct: number;
  total: number;
}

export interface ExamHistoryEntry {
  id: string;
  examId: string;
  title: string;
  catalogMode: ExamCatalogMode;
  experienceMode: ExamExperienceMode;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  scorePercentage: number;
  totalQuestions: number;
  correctCount: number;
  flaggedCount: number;
  topicBreakdown: TopicBreakdown[];
  questionIds: string[];
  weakTopicIds: string[];
}

export interface BookmarkState {
  lessonIds: string[];
  questionIds: string[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  lastReadAt?: string;
  totalMinutesSpent: number;
}

export interface QuestionPerformance {
  questionId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastAnsweredCorrectly: boolean | null;
  lastAnsweredAt?: string;
}

export interface LearnerProfile {
  id: string;
  displayName: string;
  roleLabel: string;
  learningGoal: string;
  dailyStudyMinutes: number;
  targetExamDate?: string;
  streakDays: number;
  joinedAt: string;
}

export interface QuestionBankFilters {
  topicId?: string;
  difficulty: QuestionDifficulty | 'all';
  status: QuestionStatusFilter;
  bookmarkedOnly: boolean;
  searchText: string;
}

export interface SearchResult {
  id: string;
  kind: 'topic' | 'lesson' | 'question';
  title: string;
  subtitle: string;
  topicId?: string;
  lessonId?: string;
  questionId?: string;
  tags: string[];
}

export interface ExamSessionQuestion {
  questionId: string;
  optionOrder: OptionId[];
  position: number;
}

export interface ExamSession {
  id: string;
  examId: string;
  title: string;
  sourceTopicIds: string[];
  catalogMode: ExamCatalogMode;
  experienceMode: ExamExperienceMode;
  startedAt: string;
  expiresAt?: string;
  durationMinutes: number;
  passingScore: number;
  revealAnswersInstantly: boolean;
  items: ExamSessionQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, OptionId | null>;
  flaggedQuestionIds: string[];
  submittedAt?: string;
}

export interface ExamReviewItem {
  questionId: string;
  selectedAnswer: OptionId | null;
  correctAnswer: OptionId;
  isCorrect: boolean;
  optionOrder: OptionId[];
}

export interface ExamResult {
  historyEntry: ExamHistoryEntry;
  reviewItems: ExamReviewItem[];
}

export interface AppPreferences {
  themeMode: ThemeModePreference;
  hasCompletedOnboarding: boolean;
  authMode: AuthMode;
  examDefaults: {
    experienceMode: ExamExperienceMode;
    revealAnswersInstantly: boolean;
    defaultQuestionCount: number;
    defaultDurationMinutes: number;
  };
  remindersEnabled: boolean;
}

export interface AppSnapshot {
  version: string;
  exportedAt: string;
  profile: LearnerProfile;
  preferences: AppPreferences;
  bookmarks: BookmarkState;
  lessonProgress: Record<string, LessonProgress>;
  questionPerformance: Record<string, QuestionPerformance>;
  history: ExamHistoryEntry[];
}

export interface DataTransferRecord {
  id: string;
  kind: DataTransferKind;
  status: DataTransferStatus;
  createdAt: string;
  fileName: string;
  note?: string;
}

export interface LearningCatalog {
  program: Program;
  topics: Topic[];
  lessons: Lesson[];
  questions: Question[];
  exams: ExamDefinition[];
}
