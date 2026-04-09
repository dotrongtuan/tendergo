import { useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'CompositeExamSetup'>;

const questionCountOptions = [20, 30, 40, 50];
const durationOptions = [30, 45, 60, 75];

export function CompositeExamSetupScreen({ navigation }: Props) {
  const { data } = useCatalogQuery();
  const theme = useAppTheme();
  const defaults = useAppStore((state) => state.preferences.examDefaults);
  const setExamDefaults = useAppStore((state) => state.setExamDefaults);
  const startExamSession = useAppStore((state) => state.startExamSession);
  const [experienceMode, setExperienceMode] = useState(defaults.experienceMode);
  const [questionCount, setQuestionCount] = useState(questionCountOptions.includes(defaults.defaultQuestionCount) ? defaults.defaultQuestionCount : 30);
  const [durationMinutes, setDurationMinutes] = useState(durationOptions.includes(defaults.defaultDurationMinutes) ? defaults.defaultDurationMinutes : 45);

  const exam = data?.exams.find((item) => item.mode === 'comprehensive');

  if (!data || !exam) {
    return null;
  }

  return (
    <AppScreen>
      <PageHeader
        eyebrow="Đề tổng hợp"
        title="Thi thử toàn bộ chương trình"
        description={`Trộn câu hỏi từ ${data.topics.length} chuyên đề hiện có. Phù hợp để mô phỏng kỳ thi thật hoặc ôn tập tăng cường.`}
        onBackPress={() => navigation.goBack()}
      />
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Chế độ</Text>
        <View style={styles.wrap}>
          <Button label="Luyện tập" onPress={() => setExperienceMode('practice')} variant={experienceMode === 'practice' ? 'primary' : 'secondary'} />
          <Button label="Mô phỏng thi" onPress={() => setExperienceMode('simulation')} variant={experienceMode === 'simulation' ? 'primary' : 'secondary'} />
        </View>
      </Card>
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Số câu</Text>
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
      <Button
        label="Tạo đề tổng hợp"
        onPress={() => {
          setExamDefaults({
            experienceMode,
            defaultQuestionCount: questionCount,
            defaultDurationMinutes: durationMinutes,
          });
          startExamSession(
            createExamSession({
              exam,
              questionPool: data.questions,
              experienceMode,
              questionCount,
              durationMinutes,
              revealAnswersInstantly: false,
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
