import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Topics: undefined;
  QuestionBank: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  AuthGateway: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TopicDetail: { topicId: string };
  TopicSources: { topicId: string };
  LessonReader: { lessonId: string };
  QuestionFilter: undefined;
  TopicExamSetup: { topicId: string };
  CompositeExamSetup: undefined;
  ExamSession: undefined;
  ExamResult: { historyId: string };
  ReviewAnswers: { historyId: string };
  Bookmarks: undefined;
  Search: undefined;
  Settings: undefined;
  ImportExport: undefined;
};
