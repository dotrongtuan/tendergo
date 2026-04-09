import { useMemo } from 'react';
import { RefreshControl, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { TopicCard } from '../../components/TopicCard';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useRootNavigation } from '../../navigation/helpers';
import { useAppStore } from '../../store/useAppStore';

export function TopicsListScreen() {
  const navigation = useRootNavigation();
  const { data, isLoading, refetch } = useCatalogQuery();
  const lessonProgress = useAppStore((state) => state.lessonProgress);

  const topicCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.topics
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((topic) => {
        const completed = topic.lessonIds.filter((lessonId) => lessonProgress[lessonId]?.completed).length;
        const progress = topic.lessonIds.length ? (completed / topic.lessonIds.length) * 100 : 0;
        return { topic, progress };
      });
  }, [data, lessonProgress]);

  return (
    <AppScreen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
      <PageHeader
        eyebrow="Danh mục học"
        title="Các chuyên đề ôn thi"
        description="Giữ nguyên đánh số chuyên đề theo đề cương đầu vào, kể cả việc hiện chưa có Chuyên đề 9."
        rightActionIcon="search-outline"
        onRightActionPress={() => navigation.navigate('Search')}
      />
      <SectionHeader title="Lộ trình hiện có" subtitle={`${topicCards.length} chuyên đề sẵn sàng để học và tạo đề thử`} />
      {topicCards.length ? (
        <View style={{ gap: 14 }}>
          {topicCards.map(({ topic, progress }) => (
            <TopicCard
              key={topic.id}
              code={topic.code}
              title={topic.name}
              description={topic.shortDescription}
              tags={topic.tags}
              progress={progress}
              onPress={() => navigation.navigate('TopicDetail', { topicId: topic.id })}
            />
          ))}
        </View>
      ) : (
        <EmptyState title="Chưa có chuyên đề" description="Dữ liệu seed chưa được nạp." />
      )}
    </AppScreen>
  );
}
