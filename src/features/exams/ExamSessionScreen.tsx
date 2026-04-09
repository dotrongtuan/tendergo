import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { ProgressBar } from '../../components/ProgressBar';
import { QuestionCard } from '../../components/QuestionCard';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useSessionTimer } from '../../hooks/useSessionTimer';
import { useRootNavigation } from '../../navigation/helpers';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import { formatDurationSeconds } from '../../utils/format';
import { gradeExamSession } from '../../utils/quiz';

export function ExamSessionScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const session = useAppStore((state) => state.activeSession);
  const answerQuestion = useAppStore((state) => state.answerQuestion);
  const nextQuestion = useAppStore((state) => state.nextQuestion);
  const previousQuestion = useAppStore((state) => state.previousQuestion);
  const toggleQuestionFlag = useAppStore((state) => state.toggleQuestionFlag);
  const submitActiveSession = useAppStore((state) => state.submitActiveSession);
  const abandonActiveSession = useAppStore((state) => state.abandonActiveSession);

  const submitNow = () => {
    if (!session || !data) {
      return;
    }
    const result = gradeExamSession(session, data.questions);
    submitActiveSession(result);
    navigation.replace('ExamResult', { historyId: result.historyEntry.id });
  };

  const remainingSeconds = useSessionTimer(
    session,
    session?.experienceMode === 'simulation' ? submitNow : undefined,
  );

  if (!session || !data) {
    return (
      <AppScreen>
        <PageHeader title="Không có bài thi đang mở" onBackPress={() => navigation.goBack()} />
      </AppScreen>
    );
  }

  const currentItem = session.items[session.currentQuestionIndex];
  const currentQuestion = data.questions.find((question) => question.id === currentItem?.questionId);
  const selectedAnswer = currentItem ? session.answers[currentItem.questionId] : null;

  if (!currentItem || !currentQuestion) {
    return null;
  }

  return (
    <AppScreen>
      <PageHeader
        eyebrow={session.experienceMode === 'simulation' ? 'Exam simulation' : 'Practice mode'}
        title={session.title}
        description={`Câu ${session.currentQuestionIndex + 1}/${session.items.length}`}
        onBackPress={() =>
          Alert.alert('Rời bài thi', 'Tiến trình hiện tại sẽ bị hủy. Bạn có chắc chắn muốn thoát?', [
            { text: 'Tiếp tục làm bài' },
            {
              text: 'Thoát',
              style: 'destructive',
              onPress: () => {
                abandonActiveSession();
                navigation.goBack();
              },
            },
          ])
        }
      />
      <Card>
        <View style={styles.sessionHeader}>
          <Text style={[styles.timer, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
            {formatDurationSeconds(remainingSeconds)}
          </Text>
          <Button
            label={session.flaggedQuestionIds.includes(currentItem.questionId) ? 'Bỏ đánh dấu' : 'Đánh dấu'}
            onPress={() => toggleQuestionFlag(currentItem.questionId)}
            variant="secondary"
          />
        </View>
        <ProgressBar value={((session.currentQuestionIndex + 1) / session.items.length) * 100} />
      </Card>
      <QuestionCard
        question={currentQuestion}
        optionOrder={currentItem.optionOrder}
        selectedAnswer={selectedAnswer}
        showResult={session.experienceMode === 'practice' && session.revealAnswersInstantly && Boolean(selectedAnswer)}
        showExplanation={session.experienceMode === 'practice' && session.revealAnswersInstantly && Boolean(selectedAnswer)}
        onSelectAnswer={(answer) => answerQuestion(currentItem.questionId, answer)}
      />
      <View style={styles.navButtons}>
        <Button label="Câu trước" onPress={previousQuestion} variant="secondary" />
        <Button label="Câu sau" onPress={nextQuestion} variant="secondary" />
      </View>
      <Button label="Nộp bài" onPress={submitNow} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  timer: { fontSize: 28 },
  navButtons: { flexDirection: 'row', gap: 12 },
});
