import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsScreen } from '../features/analytics/AnalyticsScreen';
import { HomeDashboardScreen } from '../features/home/HomeDashboardScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { QuestionBankScreen } from '../features/questions/QuestionBankScreen';
import { TopicsListScreen } from '../features/topics/TopicsListScreen';
import { useAppTheme } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const iconMap: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Topics: 'library-outline',
  QuestionBank: 'help-buoy-outline',
  Analytics: 'stats-chart-outline',
  Profile: 'person-outline',
};

export function MainTabs() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 64 + Math.max(insets.bottom, 10),
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: theme.typography.label,
        },
        tabBarIcon: ({ color, size }) => <Ionicons name={iconMap[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeDashboardScreen} options={{ title: 'Tổng quan' }} />
      <Tab.Screen name="Topics" component={TopicsListScreen} options={{ title: 'Chuyên đề' }} />
      <Tab.Screen name="QuestionBank" component={QuestionBankScreen} options={{ title: 'Câu hỏi' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Phân tích' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}
