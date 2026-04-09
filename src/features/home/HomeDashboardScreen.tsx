import { useMemo } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { HeroBanner } from '../../components/HeroBanner';
import { MetricCard } from '../../components/MetricCard';
import { PageHeader } from '../../components/PageHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { TopicCard } from '../../components/TopicCard';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useRootNavigation } from '../../navigation/helpers';
import { buildHomeDashboardData } from '../../services/homeService';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import { formatDateTime, formatPercent } from '../../utils/format';

export function HomeDashboardScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const { data, isLoading, refetch } = useCatalogQuery();
  const profile = useAppStore((state) => state.profile);
  const history = useAppStore((state) => state.history);
  const lessonProgress = useAppStore((state) => state.lessonProgress);
  const questionPerformance = useAppStore((state) => state.questionPerformance);
  const { isTablet } = useResponsiveLayout();

  const dashboard = useMemo(() => {
    if (!data) {
      return null;
    }
    return buildHomeDashboardData(data, lessonProgress, questionPerformance, history);
  }, [data, history, lessonProgress, questionPerformance]);

  if (!data || !dashboard) {
    return (
      <AppScreen>
        <PageHeader title="Tổng quan học tập" />
        <EmptyState title="Đang chuẩn bị dữ liệu" description="Vui lòng tải lại sau ít giây." />
      </AppScreen>
    );
  }

  return (
    <AppScreen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
      <PageHeader eyebrow={`Xin chào, ${profile.displayName}`} title="Dashboard ôn thi" description="Một điểm nhìn nhanh về tiến độ học, lịch sử làm bài và nội dung nên ôn tiếp theo." rightActionIcon="search-outline" onRightActionPress={() => navigation.navigate('Search')} />
      <HeroBanner
        eyebrow="Lộ trình ôn thi"
        title="Tiến từng bước để chạm mốc 80%"
        description="Theo dõi streak, tiến độ học và chuyển ngay sang đề tổng hợp khi cần mô phỏng kỳ thi thật."
        stats={[
          { label: 'Streak', value: `${profile.streakDays} ngày` },
          { label: 'Đề đã làm', value: `${history.length}` },
          { label: 'Tiến độ', value: formatPercent(dashboard.completion) },
        ]}
      />
      <View style={[styles.metrics, isTablet && styles.metricsTablet]}>
        <MetricCard label="Tiến độ học" value={formatPercent(dashboard.completion)} />
        <MetricCard label="Streak" value={`${profile.streakDays} ngày`} />
      </View>
      <Card>
        <SectionHeader title="Hành động nhanh" />
        <View style={styles.actions}>
          <Button label="Thi thử tổng hợp" onPress={() => navigation.navigate('CompositeExamSetup')} />
          <Button label="Mở bookmark" onPress={() => navigation.navigate('Bookmarks')} variant="secondary" />
        </View>
      </Card>
      <SectionHeader
        title="Chuyên đề nổi bật"
        actionLabel="Xem tất cả"
        onPressAction={() => navigation.navigate('MainTabs', { screen: 'Topics' })}
      />
      <View style={styles.topicList}>
        {dashboard.featuredTopics.map((topic) => {
          const progress = dashboard.topicProgressById[topic.id] ?? 0;
          return (
            <TopicCard
              key={topic.id}
              code={topic.code}
              title={topic.name}
              description={topic.shortDescription}
              tags={topic.tags}
              progress={progress}
              onPress={() => navigation.navigate('TopicDetail', { topicId: topic.id })}
            />
          );
        })}
      </View>
      <Card>
        <SectionHeader title="Lịch sử làm bài gần đây" />
        {dashboard.recentHistory.map((item) => (
          <View key={item.id} style={styles.historyRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.historyTitle, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>{item.title}</Text>
              <Text style={[styles.historyMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
                {formatDateTime(item.completedAt)}
              </Text>
            </View>
            <Text style={[styles.historyScore, { color: theme.colors.primary, fontFamily: theme.typography.heading }]}>{item.scorePercentage}%</Text>
          </View>
        ))}
      </Card>
      <Card>
        <SectionHeader title="Gợi ý cần ôn" />
        {dashboard.weakTopics.map((item) => (
          <Text key={item.topicId} style={[styles.recommendation, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
            • {item.topicName}: độ chính xác {Math.round(item.accuracy)}%, nên ôn thêm bài và luyện câu sai.
          </Text>
        ))}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metricsTablet: { alignItems: 'stretch' },
  actions: { gap: 12 },
  topicList: { gap: 14 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  historyTitle: { fontSize: 14, lineHeight: 20 },
  historyMeta: { fontSize: 12, lineHeight: 18 },
  historyScore: { fontSize: 18 },
  recommendation: { fontSize: 14, lineHeight: 22 },
});
