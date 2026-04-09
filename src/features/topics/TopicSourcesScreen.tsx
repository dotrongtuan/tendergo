import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../theme';
import { unique } from '../../utils/array';

type Props = NativeStackScreenProps<RootStackParamList, 'TopicSources'>;

export function TopicSourcesScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const topic = data?.topics.find((item) => item.id === route.params.topicId);
  const lessons = data?.lessons.filter((lesson) => lesson.topicId === route.params.topicId) ?? [];
  const references = unique([
    ...(topic?.sourceDocument?.legalReferences ?? []),
    ...lessons.flatMap((lesson) => lesson.references),
  ]).filter(Boolean);
  const importedQuestionCount =
    data?.questions.filter(
      (question) =>
        question.topicId === route.params.topicId &&
        Boolean(topic?.sourceDocument?.fileName) &&
        question.source.includes(topic?.sourceDocument?.fileName ?? ''),
    ).length ?? 0;

  if (!topic) {
    return (
      <AppScreen>
        <PageHeader title="Không tìm thấy nguồn tài liệu" onBackPress={() => navigation.goBack()} />
        <EmptyState
          title="Thiếu metadata nguồn"
          description="Chuyên đề này chưa có dữ liệu nguồn tài liệu để hiển thị."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <PageHeader
        eyebrow={topic.code}
        title="Nguồn tài liệu chuyên đề"
        description="Theo dõi file nguồn, căn cứ tham chiếu và ghi chú import để kiểm soát chất lượng dữ liệu học tập."
        onBackPress={() => navigation.goBack()}
      />
      <Card>
        <SectionHeader
          title="Tài liệu gốc"
          subtitle={topic.sourceDocument?.fileName ?? 'Chưa có thông tin file nguồn'}
        />
        <Text style={[styles.title, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
          {topic.sourceDocument?.documentTitle ?? topic.name}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
          {topic.sourceDocument?.importedNote ??
            'Dữ liệu học tập được nhập từ file người dùng cung cấp và cần tiếp tục được chuyên gia nghiệp vụ rà soát trước khi dùng chính thức.'}
        </Text>
      </Card>
      <Card>
        <SectionHeader title="Dấu vết import" subtitle="Tóm tắt dữ liệu đã nạp vào app" />
        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
              {lessons.length}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
              Bài học
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
              {importedQuestionCount}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
              Câu hỏi
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
              {references.length}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
              Tham chiếu
            </Text>
          </View>
        </View>
      </Card>
      <Card>
        <SectionHeader title="Căn cứ và nguồn tham chiếu" subtitle={`${references.length} mục đã được gắn vào chuyên đề`} />
        {references.length ? (
          references.map((reference) => (
            <Text key={reference} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
              • {reference}
            </Text>
          ))
        ) : (
          <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
            Chưa có danh mục căn cứ cụ thể cho chuyên đề này.
          </Text>
        )}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, lineHeight: 24 },
  body: { fontSize: 14, lineHeight: 22 },
  metrics: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metricItem: { minWidth: 88, gap: 4 },
  metricValue: { fontSize: 28 },
  metricLabel: { fontSize: 13, lineHeight: 18 },
});
