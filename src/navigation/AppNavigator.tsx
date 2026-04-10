import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BookmarksScreen } from '../features/bookmarks/BookmarksScreen';
import { CompositeExamSetupScreen } from '../features/exams/CompositeExamSetupScreen';
import { ExamHistoryScreen } from '../features/exams/ExamHistoryScreen';
import { ExamResultScreen } from '../features/exams/ExamResultScreen';
import { ExamSessionScreen } from '../features/exams/ExamSessionScreen';
import { ReviewAnswersScreen } from '../features/exams/ReviewAnswersScreen';
import { TopicExamSetupScreen } from '../features/exams/TopicExamSetupScreen';
import { ImportExportScreen } from '../features/import-export/ImportExportScreen';
import { AuthGatewayScreen } from '../features/onboarding/AuthGatewayScreen';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { SettingsScreen } from '../features/profile/SettingsScreen';
import { QuestionFilterScreen } from '../features/questions/QuestionFilterScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { LessonReaderScreen } from '../features/topics/LessonReaderScreen';
import { TopicDetailScreen } from '../features/topics/TopicDetailScreen';
import { TopicSourcesScreen } from '../features/topics/TopicSourcesScreen';
import { useAppStore } from '../store/useAppStore';
import { useNavigationTheme } from '../theme';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const navigationTheme = useNavigationTheme();
  const hasCompletedOnboarding = useAppStore((state) => state.preferences.hasCompletedOnboarding);
  const authMode = useAppStore((state) => state.preferences.authMode);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !authMode ? (
          <Stack.Screen name="AuthGateway" component={AuthGatewayScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
            <Stack.Screen name="TopicSources" component={TopicSourcesScreen} />
            <Stack.Screen name="LessonReader" component={LessonReaderScreen} />
            <Stack.Screen name="QuestionFilter" component={QuestionFilterScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="TopicExamSetup" component={TopicExamSetupScreen} />
            <Stack.Screen name="CompositeExamSetup" component={CompositeExamSetupScreen} />
            <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} />
            <Stack.Screen name="ExamSession" component={ExamSessionScreen} />
            <Stack.Screen name="ExamResult" component={ExamResultScreen} />
            <Stack.Screen name="ReviewAnswers" component={ReviewAnswersScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ImportExport" component={ImportExportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
