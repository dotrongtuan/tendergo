import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { HeroBanner } from '../../components/HeroBanner';
import { MetricCard } from '../../components/MetricCard';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import type { RootStackParamList } from '../../navigation/types';
import { buildExamResultDetail, getExamHistoryEntry } from '../../services/examService';
import { useAppTheme } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ExamResult'>;

export function ExamResultScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const history = useAppStore((state) => state.history);
  const historyEntry = getExamHistoryEntry(history, route.params.historyId);

  if (!historyEntry) {
    return null;
  }

  const breakdown = data ? buildExamResultDetail(data, historyEntry) : [];

  return (
    <AppScreen>
      <PageHeader
        eyebrow={historyEntry.scorePercentage >= 75 ? 'Hoàn thành tốt' : 'Cần ôn thêm'}
        title={`Kết quả ${historyEntry.scorePercentage}%`}
        description={`Nộp lúc ${formatDateTime(historyEntry.completedAt)}`}
        onBackPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      />
      <HeroBanner
        eyebrow={historyEntry.scorePercentage >= 75 ? 'Kết quả bài thi' : 'Cần ôn trọng tâm'}
        title={historyEntry.scorePercentage >= 75 ? 'Bạn đang đi đúng nhịp ôn tập' : 'Cần thêm một vòng ôn trọng tâm'}
        description="Kết quả dưới đây được dùng để cập nhật thống kê cá nhân, chuyên đề yếu và dữ liệu review đáp án."
        stats={[
          { label: 'Điểm', value: `${historyEntry.scorePercentage}%` },
          { label: 'Đúng', value: `${historyEntry.correctCount}/${historyEntry.totalQuestions}` },
          { label: 'Đánh dấu', value: `${historyEntry.flaggedCount}` },
        ]}
      />
      <View style={styles.metrics}>
        <MetricCard label="Số câu đúng" value={`${historyEntry.correctCount}/${historyEntry.totalQuestions}`} />
        <MetricCard label="Câu đánh dấu" value={`${historyEntry.flaggedCount}`} />
      </View>
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Breakdown theo chuyên đề</Text>
        {breakdown.map((item) => {
          return (
            <View key={item.topicId} style={styles.row}>
              <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>{item.topicCode}</Text>
              <Text style={[styles.body, { color: theme.colors.primary, fontFamily: theme.typography.label }]}>
                {item.correct}/{item.total}
              </Text>
            </View>
          );
        })}
      </Card>
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Gợi ý ôn lại</Text>
        {historyEntry.weakTopicIds.map((topicId) => (
          <Text key={topicId} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
            • {data?.topics.find((topic) => topic.id === topicId)?.name ?? topicId}
          </Text>
        ))}
      </Card>
      <View style={styles.actions}>
        <Button label="Review đáp án" onPress={() => navigation.navigate('ReviewAnswers', { historyId: historyEntry.id })} />
        <Button label="Tạo đề tổng hợp mới" onPress={() => navigation.navigate('CompositeExamSetup')} variant="secondary" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: 17, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22 },
  actions: { gap: 12 },
});
