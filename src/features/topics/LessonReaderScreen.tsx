import { useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { PageHeader } from '../../components/PageHeader';
import { RichContent } from '../../components/RichContent';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonReader'>;

export function LessonReaderScreen({ navigation, route }: Props) {
  const { data } = useCatalogQuery();
  const theme = useAppTheme();
  const lesson = data?.lessons.find((item) => item.id === route.params.lessonId);
  const toggleLessonBookmark = useAppStore((state) => state.toggleLessonBookmark);
  const markLessonCompleted = useAppStore((state) => state.markLessonCompleted);
  const markLessonVisited = useAppStore((state) => state.markLessonVisited);
  const bookmarks = useAppStore((state) => state.bookmarks.lessonIds);

  useEffect(() => {
    if (lesson) {
      markLessonVisited(lesson.id, 6);
    }
  }, [lesson, markLessonVisited]);

  if (!lesson) {
    return null;
  }

  return (
    <AppScreen>
      <PageHeader
        eyebrow="Bài học"
        title={lesson.title}
        description={`${lesson.estimatedStudyTime} phút • ${lesson.references.length} ghi chú tham chiếu`}
        onBackPress={() => navigation.goBack()}
      />
      <RichContent content={lesson.content} />
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Ý chính cần nhớ</Text>
        {lesson.keyPoints.map((point) => (
          <Text key={point} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
            • {point}
          </Text>
        ))}
      </Card>
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Ghi nhớ nhanh</Text>
        <View style={styles.tags}>
          {lesson.quickNotes.map((note) => (
            <Chip key={note} label={note} tone="accent" />
          ))}
        </View>
      </Card>
      {lesson.example ? (
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Ví dụ minh họa</Text>
          <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>{lesson.example}</Text>
        </Card>
      ) : null}
      <View style={styles.actions}>
        <Button label={bookmarks.includes(lesson.id) ? 'Bỏ bookmark bài học' : 'Bookmark bài học'} onPress={() => toggleLessonBookmark(lesson.id)} variant="secondary" />
        <Button label="Đánh dấu đã học" onPress={() => markLessonCompleted(lesson.id)} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 17 },
  body: { fontSize: 14, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { gap: 12 },
});
