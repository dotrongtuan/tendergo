import { useMemo } from 'react';
import { View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { HeatmapChart, TopicPerformanceList, TrendChart } from '../../components/Charts';
import { EmptyState } from '../../components/EmptyState';
import { MetricCard } from '../../components/MetricCard';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useRootNavigation } from '../../navigation/helpers';
import { useAppStore } from '../../store/useAppStore';
import { buildScoreTrend, buildStudyHeatmap, buildTopicAnalytics, getCompletionPercentage, getStrongTopics, getWeakTopics } from '../../utils/analytics';
import { formatPercent } from '../../utils/format';

export function AnalyticsScreen() {
  const navigation = useRootNavigation();
  const { data } = useCatalogQuery();
  const history = useAppStore((state) => state.history);
  const lessonProgress = useAppStore((state) => state.lessonProgress);
  const questionPerformance = useAppStore((state) => state.questionPerformance);

  const analytics = useMemo(() => {
    if (!data) {
      return null;
    }

    const rows = buildTopicAnalytics(
      data.topics,
      data.lessons,
      data.questions,
      questionPerformance,
      lessonProgress,
    );

    return {
      rows,
      heatmap: buildStudyHeatmap(history),
      trend: buildScoreTrend(history),
      completion: getCompletionPercentage(data.lessons, lessonProgress),
      weakTopics: getWeakTopics(rows),
      strongTopics: getStrongTopics(rows),
    };
  }, [data, history, lessonProgress, questionPerformance]);

  if (!data || !analytics) {
    return (
      <AppScreen>
        <PageHeader title="Phân tích học tập" />
        <EmptyState title="Chưa có dữ liệu" description="Hãy học một bài hoặc làm một đề để bắt đầu theo dõi tiến độ." />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <PageHeader
        eyebrow="Analytics"
        title="Phân tích học tập"
        description="Theo dõi tiến độ hoàn thành, xu hướng điểm số và chuyên đề mạnh yếu theo thời gian."
        rightActionIcon="bookmark-outline"
        onRightActionPress={() => navigation.navigate('Bookmarks')}
      />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <MetricCard label="Tiến độ học" value={formatPercent(analytics.completion)} />
        <MetricCard label="Số đề đã làm" value={`${history.length}`} />
      </View>
      <TrendChart title="Xu hướng điểm gần đây" data={analytics.trend} />
      <HeatmapChart title="Heatmap khối lượng luyện đề 21 ngày" cells={analytics.heatmap} />
      <TopicPerformanceList rows={analytics.rows} />
      <View style={{ gap: 16 }}>
        <MetricCard
          label="Chuyên đề cần ôn lại"
          value={analytics.weakTopics.map((item) => item.topicName.split(':')[0]).join(', ') || 'Chưa có'}
          helper="Dựa trên độ chính xác và số bài học đã hoàn thành."
        />
        <MetricCard
          label="Chuyên đề đang tốt"
          value={analytics.strongTopics.map((item) => item.topicName.split(':')[0]).join(', ') || 'Chưa có'}
          helper="Những chuyên đề có tỷ lệ đúng và tiến độ học tốt hơn mặt bằng hiện tại."
        />
      </View>
    </AppScreen>
  );
}
