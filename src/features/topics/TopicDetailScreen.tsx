import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { EmptyState } from '../../components/EmptyState';
import { HeroBanner } from '../../components/HeroBanner';
import { PageHeader } from '../../components/PageHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { buildTopicDetailData } from '../../services/topicService';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TopicDetail'>;

export function TopicDetailScreen({ navigation, route }: Props) {
  const { data } = useCatalogQuery();
  const theme = useAppTheme();
  const lessonProgress = useAppStore((state) => state.lessonProgress);
  const updateQuestionBankFilters = useAppStore((state) => state.updateQuestionBankFilters);
  const { isTablet } = useResponsiveLayout();
  const { topicId } = route.params;

  const detail = data ? buildTopicDetailData(data, topicId, lessonProgress) : null;
  const topic = detail?.topic;
  const lessons = detail?.lessons ?? [];

  if (!topic) {
    return (
      <AppScreen>
        <PageHeader title="Không tìm thấy chuyên đề" onBackPress={() => navigation.goBack()} />
        <EmptyState title="Thiếu dữ liệu" description="Chuyên đề này không tồn tại trong seed hiện tại." />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <PageHeader
        eyebrow={topic.code}
        title={topic.name}
        description={topic.shortDescription}
        onBackPress={() => navigation.goBack()}
        rightActionIcon="create-outline"
        onRightActionPress={() => navigation.navigate('TopicExamSetup', { topicId })}
      />
      <HeroBanner
        eyebrow={`Chuyên đề ${topic.code}`}
        title="Học lý thuyết, chốt ý nhanh, rồi thi thử ngay"
        description="Mỗi chuyên đề được thiết kế để học theo lớp: mục tiêu, bài học, flash summary và luồng chuyển thẳng sang ngân hàng câu hỏi hoặc đề thử."
        stats={[
          { label: 'Bài học', value: `${lessons.length}` },
          { label: 'Câu mẫu', value: `${detail?.questionCount ?? 0}` },
          { label: 'Tiến độ', value: `${Math.round(detail?.progress ?? 0)}%` },
        ]}
      />
      <Card>
        <SectionHeader title="Mục tiêu học tập" />
        {topic.learningObjectives.map((objective) => (
          <Text key={objective} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
            • {objective}
          </Text>
        ))}
      </Card>
      <Card>
        <SectionHeader title="Bài học trong chuyên đề" subtitle={`${lessons.length} bài học`} />
        <View style={styles.lessonList}>
          {lessons.map((lesson) => (
            <Card key={lesson.id} onPress={() => navigation.navigate('LessonReader', { lessonId: lesson.id })} style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <Text style={[styles.lessonTitle, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>{lesson.title}</Text>
                <Chip label={lessonProgress[lesson.id]?.completed ? 'Đã học' : `${lesson.estimatedStudyTime} phút`} tone={lessonProgress[lesson.id]?.completed ? 'success' : 'muted'} />
              </View>
              <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{lesson.keyPoints[0]}</Text>
            </Card>
          ))}
        </View>
      </Card>
      <Card>
        <SectionHeader title="Flash summary" />
        {topic.flashSummary.map((item) => (
          <Text key={item} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
            • {item}
          </Text>
        ))}
      </Card>
      <View style={[styles.actions, isTablet && styles.actionsTablet]}>
        <Button label="Thi thử chuyên đề" onPress={() => navigation.navigate('TopicExamSetup', { topicId })} />
        <Button
          label="Mở ngân hàng câu hỏi"
          onPress={() => {
            updateQuestionBankFilters({ topicId });
            navigation.navigate('MainTabs', { screen: 'QuestionBank' });
          }}
          variant="secondary"
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, lineHeight: 22 },
  lessonList: { gap: 12 },
  lessonCard: { padding: 14 },
  lessonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  lessonTitle: { flex: 1, fontSize: 15, lineHeight: 22 },
  actions: { gap: 12, flexDirection: 'column' },
  actionsTablet: { flexDirection: 'row' },
});
