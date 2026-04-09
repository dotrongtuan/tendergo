import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useRootNavigation } from '../../navigation/helpers';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';

export function BookmarksScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const lessonBookmarks = useAppStore((state) => state.bookmarks.lessonIds);
  const questionBookmarks = useAppStore((state) => state.bookmarks.questionIds);

  const lessons = data?.lessons.filter((lesson) => lessonBookmarks.includes(lesson.id)) ?? [];
  const questions = data?.questions.filter((question) => questionBookmarks.includes(question.id)).slice(0, 12) ?? [];

  return (
    <AppScreen>
      <PageHeader title="Bookmark & ôn lại" description="Danh sách bài học và câu hỏi đã đánh dấu để ôn tập cá nhân." onBackPress={() => navigation.goBack()} />
      {!lessons.length && !questions.length ? (
        <EmptyState title="Chưa có bookmark" description="Hãy đánh dấu bài học hoặc câu hỏi trong lúc học để quay lại nhanh hơn." />
      ) : (
        <>
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Bài học đã lưu</Text>
            {lessons.map((lesson) => (
              <Text key={lesson.id} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
                • {lesson.title}
              </Text>
            ))}
          </Card>
          <Card>
            <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Câu hỏi đã lưu</Text>
            {questions.map((question) => (
              <Text key={question.id} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
                • {question.question}
              </Text>
            ))}
          </Card>
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 17, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22 },
});
