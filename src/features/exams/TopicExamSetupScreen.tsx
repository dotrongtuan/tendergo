import { useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import { createExamSession } from '../../utils/quiz';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TopicExamSetup'>;

const questionCountOptions = [10, 15, 18];
const durationOptions = [15, 25, 35];

export function TopicExamSetupScreen({ navigation, route }: Props) {
  const { data } = useCatalogQuery();
  const theme = useAppTheme();
  const defaults = useAppStore((state) => state.preferences.examDefaults);
  const setExamDefaults = useAppStore((state) => state.setExamDefaults);
  const startExamSession = useAppStore((state) => state.startExamSession);
  const [experienceMode, setExperienceMode] = useState(defaults.experienceMode);
  const [questionCount, setQuestionCount] = useState(questionCountOptions.includes(defaults.defaultQuestionCount) ? defaults.defaultQuestionCount : 15);
  const [durationMinutes, setDurationMinutes] = useState(durationOptions.includes(defaults.defaultDurationMinutes) ? defaults.defaultDurationMinutes : 25);
  const [revealAnswersInstantly, setRevealAnswersInstantly] = useState(defaults.revealAnswersInstantly);
  const topic = data?.topics.find((item) => item.id === route.params.topicId);
  const exam = data?.exams.find((item) => item.topicIds.length === 1 && item.topicIds[0] === route.params.topicId);

  const summary = useMemo(() => {
    if (!topic || !data) {
      return '';
    }
    const questionCountForTopic = data.questions.filter((question) => question.topicId === topic.id).length;
    return `${questionCountForTopic} câu mẫu sẵn sàng cho chuyên đề ${topic.code}.`;
  }, [data, topic]);

  if (!topic || !exam || !data) {
    return null;
  }

  return (
    <AppScreen>
      <PageHeader
        eyebrow={topic.code}
        title="Thi thử theo chuyên đề"
        description={summary}
        onBackPress={() => navigation.goBack()}
      />
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Chế độ làm bài</Text>
        <View style={styles.wrap}>
          <Button label="Luyện tập" onPress={() => setExperienceMode('practice')} variant={experienceMode === 'practice' ? 'primary' : 'secondary'} />
          <Button label="Mô phỏng thi" onPress={() => setExperienceMode('simulation')} variant={experienceMode === 'simulation' ? 'primary' : 'secondary'} />
        </View>
      </Card>
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Số câu hỏi</Text>
        <View style={styles.wrap}>
          {questionCountOptions.map((count) => (
            <Button
              key={count}
              label={`${count} câu`}
              onPress={() => setQuestionCount(count)}
              variant={questionCount === count ? 'primary' : 'secondary'}
            />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Thời gian</Text>
        <View style={styles.wrap}>
          {durationOptions.map((minutes) => (
            <Button
              key={minutes}
              label={`${minutes} phút`}
              onPress={() => setDurationMinutes(minutes)}
              variant={durationMinutes === minutes ? 'primary' : 'secondary'}
            />
          ))}
        </View>
      </Card>
      {experienceMode === 'practice' ? (
        <Card>
          <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Hiển thị đáp án</Text>
          <View style={styles.wrap}>
            <Button label="Ngay sau khi chọn" onPress={() => setRevealAnswersInstantly(true)} variant={revealAnswersInstantly ? 'primary' : 'secondary'} />
            <Button label="Chỉ xem cuối bài" onPress={() => setRevealAnswersInstantly(false)} variant={!revealAnswersInstantly ? 'primary' : 'secondary'} />
          </View>
        </Card>
      ) : null}
      <Button
        label="Bắt đầu làm bài"
        onPress={() => {
          setExamDefaults({
            experienceMode,
            defaultQuestionCount: questionCount,
            defaultDurationMinutes: durationMinutes,
            revealAnswersInstantly,
          });
          startExamSession(
            createExamSession({
              exam,
              questionPool: data.questions,
              experienceMode,
              questionCount,
              durationMinutes,
              revealAnswersInstantly,
            }),
          );
          navigation.navigate('ExamSession');
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
