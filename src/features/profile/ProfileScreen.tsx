import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { MetricCard } from '../../components/MetricCard';
import { PageHeader } from '../../components/PageHeader';
import { useRootNavigation } from '../../navigation/helpers';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';

export function ProfileScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const profile = useAppStore((state) => state.profile);
  const history = useAppStore((state) => state.history);
  const bookmarks = useAppStore((state) => state.bookmarks);

  return (
    <AppScreen>
      <PageHeader
        eyebrow={profile.roleLabel}
        title={profile.displayName}
        description={profile.learningGoal}
        rightActionIcon="settings-outline"
        onRightActionPress={() => navigation.navigate('Settings')}
      />
      <View style={styles.metrics}>
        <MetricCard label="Mục tiêu/ngày" value={`${profile.dailyStudyMinutes} phút`} />
        <MetricCard label="Streak" value={`${profile.streakDays} ngày`} />
      </View>
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Tóm tắt học tập</Text>
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>• {history.length} lượt làm bài đã lưu cục bộ.</Text>
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>• {bookmarks.lessonIds.length} bài học và {bookmarks.questionIds.length} câu hỏi đã bookmark.</Text>
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>• Mục tiêu hiện tại: {profile.learningGoal}</Text>
      </Card>
      <View style={styles.actions}>
        <Button label="Cài đặt" onPress={() => navigation.navigate('Settings')} />
        <Button label="Trung tâm dữ liệu" onPress={() => navigation.navigate('ImportExport')} variant="secondary" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: 17, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22 },
  actions: { gap: 12 },
});
