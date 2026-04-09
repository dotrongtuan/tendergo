import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { QuestionCard } from '../../components/QuestionCard';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import type { RootStackParamList } from '../../navigation/types';
import { buildReviewQuestions } from '../../services/examService';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewAnswers'>;

export function ReviewAnswersScreen({ navigation, route }: Props) {
  const { data } = useCatalogQuery();
  const reviewItems = useAppStore((state) => state.reviewMap[route.params.historyId] ?? []);
  const reviewQuestions = data ? buildReviewQuestions(data, reviewItems) : [];

  if (!reviewQuestions.length || !data) {
    return (
      <AppScreen>
        <PageHeader title="Review đáp án" onBackPress={() => navigation.goBack()} />
        <EmptyState title="Chưa có dữ liệu review" description="Bài thi này chưa lưu được chi tiết đáp án để xem lại." />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <PageHeader title="Review đáp án" description={`${reviewItems.length} câu đã chấm`} onBackPress={() => navigation.goBack()} />
      <View style={{ gap: 16 }}>
        {reviewQuestions.map(({ question, reviewItem }) => (
          <QuestionCard
              key={reviewItem.questionId}
              question={question}
              optionOrder={reviewItem.optionOrder}
              selectedAnswer={reviewItem.selectedAnswer}
              showResult
              showExplanation
              disableSelection
            />
        ))}
      </View>
    </AppScreen>
  );
}
