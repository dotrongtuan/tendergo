import { useDeferredValue, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { QuestionCard } from '../../components/QuestionCard';
import { SearchInput } from '../../components/SearchInput';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useRootNavigation } from '../../navigation/helpers';
import { filterQuestionBank } from '../../services/questionBankService';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';

export function QuestionBankScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const filters = useAppStore((state) => state.questionBankFilters);
  const updateFilters = useAppStore((state) => state.updateQuestionBankFilters);
  const recordQuestionAttempt = useAppStore((state) => state.recordQuestionAttempt);
  const toggleQuestionBookmark = useAppStore((state) => state.toggleQuestionBookmark);
  const bookmarkedIds = useAppStore((state) => state.bookmarks.questionIds);
  const performance = useAppStore((state) => state.questionPerformance);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const deferredSearch = useDeferredValue(filters.searchText);

  const questions = useMemo(() => {
    if (!data) {
      return [];
    }

    return filterQuestionBank(
      data,
      { ...filters, searchText: deferredSearch },
      performance,
      bookmarkedIds,
    );
  }, [bookmarkedIds, data, deferredSearch, filters, performance]);

  return (
    <AppScreen>
      <PageHeader
        eyebrow="Luyện nhanh"
        title="Ngân hàng câu hỏi"
        description="Lọc theo chuyên đề, độ khó, trạng thái và xem giải thích ngay sau khi chọn đáp án."
        rightActionIcon="options-outline"
        onRightActionPress={() => navigation.navigate('QuestionFilter')}
      />
      <SearchInput
        value={filters.searchText}
        onChangeText={(value) => updateFilters({ searchText: value })}
        placeholder="Tìm theo từ khóa, chuyên đề hoặc nội dung câu hỏi"
      />
      <Text style={[styles.caption, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
        {questions.length} câu phù hợp với bộ lọc hiện tại
      </Text>
      {questions.length ? (
        <View style={styles.list}>
          {questions.slice(0, 20).map((question) => {
            const selectedAnswer = localAnswers[question.id] as 'A' | 'B' | 'C' | 'D' | undefined;
            return (
              <View key={question.id} style={styles.questionBlock}>
                <QuestionCard
                  question={question}
                  selectedAnswer={selectedAnswer ?? null}
                  showResult={Boolean(selectedAnswer)}
                  showExplanation={Boolean(selectedAnswer)}
                  onSelectAnswer={(answer) => {
                    setLocalAnswers((current) => ({ ...current, [question.id]: answer }));
                    recordQuestionAttempt(question.id, answer === question.correctAnswer);
                  }}
                />
                <Button
                  label={bookmarkedIds.includes(question.id) ? 'Bỏ bookmark câu hỏi' : 'Bookmark câu hỏi'}
                  onPress={() => toggleQuestionBookmark(question.id)}
                  variant="ghost"
                />
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          title="Không có câu hỏi phù hợp"
          description="Hãy nới điều kiện lọc hoặc tìm bằng từ khóa ngắn hơn."
          actionLabel="Mở bộ lọc"
          onPressAction={() => navigation.navigate('QuestionFilter')}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: 13 },
  list: { gap: 16 },
  questionBlock: { gap: 10 },
});
