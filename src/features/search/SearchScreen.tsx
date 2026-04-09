import { startTransition, useDeferredValue, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { SearchInput } from '../../components/SearchInput';
import { useSearchQuery } from '../../hooks/useCatalogQueries';
import { useRootNavigation } from '../../navigation/helpers';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';

export function SearchScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const saveSearchTerm = useAppStore((state) => state.saveSearchTerm);
  const updateQuestionBankFilters = useAppStore((state) => state.updateQuestionBankFilters);
  const recentSearches = useAppStore((state) => state.recentSearches);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data } = useSearchQuery(deferredQuery);

  const results = data ?? [];

  return (
    <AppScreen>
      <PageHeader title="Tìm kiếm toàn hệ thống" description="Tìm theo chuyên đề, bài học, câu hỏi và cụm từ trong nội dung lý thuyết." onBackPress={() => navigation.goBack()} />
      <SearchInput
        value={query}
        onChangeText={(value) => {
          startTransition(() => setQuery(value));
          if (value.trim().length > 2) {
            saveSearchTerm(value);
          }
        }}
        placeholder="Ví dụ: đấu thầu qua mạng, thỏa thuận khung, tư cách hợp lệ"
      />
      {!query.trim() ? (
        <View style={styles.suggestions}>
          {recentSearches.map((item) => (
            <Pressable key={item} onPress={() => setQuery(item)} style={[styles.suggestion, { backgroundColor: theme.colors.surface }]}>
              <Text style={{ color: theme.colors.heading, fontFamily: theme.typography.bodyMedium }}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : results.length ? (
        <View style={styles.results}>
          {results.map((result) => (
            <Pressable
              key={result.id}
              onPress={() => {
                if (result.questionId) {
                  updateQuestionBankFilters({ searchText: result.title });
                  navigation.navigate('MainTabs', { screen: 'QuestionBank' });
                  return;
                }
                if (result.lessonId) {
                  navigation.navigate('LessonReader', { lessonId: result.lessonId });
                  return;
                }
                if (result.topicId) {
                  navigation.navigate('TopicDetail', { topicId: result.topicId });
                  return;
                }
              }}
              style={[styles.resultItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Text style={[styles.resultKind, { color: theme.colors.primary, fontFamily: theme.typography.label }]}>{result.kind}</Text>
              <Text style={[styles.resultTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>{result.title}</Text>
              <Text numberOfLines={2} style={[styles.resultSubtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{result.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState title="Không tìm thấy kết quả" description="Thử dùng từ khóa ngắn hơn hoặc chuyển sang tên chuyên đề." />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  suggestion: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16 },
  results: { gap: 12 },
  resultItem: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 6 },
  resultKind: { fontSize: 12, textTransform: 'uppercase' },
  resultTitle: { fontSize: 16, lineHeight: 22 },
  resultSubtitle: { fontSize: 13, lineHeight: 20 },
});
