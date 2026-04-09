import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useAppTheme } from '../theme';

interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function AppScreen({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  refreshControl,
}: AppScreenProps) {
  const theme = useAppTheme();
  const { contentMaxWidth } = useResponsiveLayout();

  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}>
        <View style={styles.outer}>
          <View style={[styles.content, { maxWidth: contentMaxWidth }, contentContainerStyle]}>{children}</View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}>
      <ScrollView
        contentContainerStyle={styles.outer}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.content, { maxWidth: contentMaxWidth }, contentContainerStyle]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  outer: { width: '100%', alignItems: 'center' },
  content: { width: '100%', paddingHorizontal: 20, paddingVertical: 18, gap: 16 },
});
