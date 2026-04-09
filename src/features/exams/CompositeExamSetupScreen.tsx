import { useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import { createExamSession } from '../../utils/quiz';

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
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(
    questionCountOptions.includes(defaults.defaultQuestionCount) ? defaults.defaultQuestionCount : 30,
  );
  const [durationMinutes, setDurationMinutes] = useState(
    durationOptions.includes(defaults.defaultDurationMinutes) ? defaults.defaultDurationMinutes : 45,
  );

  const comprehensiveExams = useMemo(
    () =>
      (data?.exams ?? []).filter((item) => item.mode === 'comprehensive').sort((left, right) => {
        const leftPreset = left.presetQuestionIds?.length ? 0 : 1;
        const rightPreset = right.presetQuestionIds?.length ? 0 : 1;
        return leftPreset - rightPreset;
      }),
    [data],
  );

  useEffect(() => {
    if (!selectedExamId && comprehensiveExams.length) {
      setSelectedExamId(comprehensiveExams[0]!.id);
    }
  }, [comprehensiveExams, selectedExamId]);

  const exam = comprehensiveExams.find((item) => item.id === selectedExamId) ?? comprehensiveExams[0];
  const isPresetExam = Boolean(exam?.presetQuestionIds?.length) || exam?.questionSelectionStrategy === 'preset';

  useEffect(() => {
    if (exam && isPresetExam) {
      setQuestionCount(exam.numberOfQuestions);
      setDurationMinutes(exam.durationMinutes);
    }
  }, [exam, isPresetExam]);

  if (!data || !exam) {
    return null;
  }

  const effectiveQuestionCount = isPresetExam ? exam.numberOfQuestions : questionCount;
  const effectiveDurationMinutes = isPresetExam ? exam.durationMinutes : durationMinutes;

  return (
    <AppScreen>
      <PageHeader
        eyebrow="Đề tổng hợp"
        title="Thi thử toàn bộ chương trình"
        description="Chọn giữa bộ đề sinh ngẫu nhiên theo ma trận chuyên đề hoặc các đề nguồn cố định đã nhập từ tài liệu thực tế."
        onBackPress={() => navigation.goBack()}
      />
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
          Chọn bộ đề
        </Text>
        <View style={styles.examList}>
          {comprehensiveExams.map((item) => {
            const selected = item.id === exam.id;
            const preset = Boolean(item.presetQuestionIds?.length);

            return (
              <Card
                key={item.id}
                onPress={() => setSelectedExamId(item.id)}
                style={[
                  styles.examChoice,
                  {
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.surface,
                  },
                ]}
              >
                <View style={styles.examChoiceHeader}>
                  <Text
                    style={[
                      styles.examTitle,
                      { color: theme.colors.heading, fontFamily: theme.typography.label },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Chip label={preset ? 'Đề nguồn' : 'Sinh ngẫu nhiên'} tone={preset ? 'accent' : 'muted'} />
                </View>
                <Text
                  style={[
                    styles.examDescription,
                    { color: theme.colors.textMuted, fontFamily: theme.typography.body },
                  ]}
                >
                  {item.description}
                </Text>
                <View style={styles.examMeta}>
                  <Chip label={`${item.numberOfQuestions} câu`} tone="muted" />
                  <Chip label={`${item.durationMinutes} phút`} tone="muted" />
                  {item.sourceFile ? <Chip label="Nguồn DOCX" tone="accent" /> : null}
                </View>
              </Card>
            );
          })}
        </View>
      </Card>
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
          Chế độ
        </Text>
        <View style={styles.wrap}>
          <Button
            label="Luyện tập"
            onPress={() => setExperienceMode('practice')}
            variant={experienceMode === 'practice' ? 'primary' : 'secondary'}
          />
          <Button
            label="Mô phỏng thi"
            onPress={() => setExperienceMode('simulation')}
            variant={experienceMode === 'simulation' ? 'primary' : 'secondary'}
          />
        </View>
      </Card>
      {isPresetExam ? (
        <Card>
          <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
            Cấu hình đề nguồn
          </Text>
          <Text style={[styles.examDescription, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
            Bộ đề này giữ nguyên số câu hỏi và thời gian theo tài liệu nguồn để mô phỏng sát đề thực tế hơn.
          </Text>
          {exam.sourceFile ? (
            <Text style={[styles.sourceText, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
              File nguồn: {exam.sourceFile}
            </Text>
          ) : null}
        </Card>
      ) : (
        <>
          <Card>
            <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
              Số câu
            </Text>
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
            <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
              Thời gian
            </Text>
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
        </>
      )}
      <Button
        label={isPresetExam ? 'Bắt đầu đề nguồn' : 'Tạo đề tổng hợp'}
        onPress={() => {
          setExamDefaults({
            experienceMode,
            defaultQuestionCount: effectiveQuestionCount,
            defaultDurationMinutes: effectiveDurationMinutes,
            revealAnswersInstantly: false,
          });
          startExamSession(
            createExamSession({
              exam,
              questionPool: data.questions,
              experienceMode,
              questionCount: effectiveQuestionCount,
              durationMinutes: effectiveDurationMinutes,
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
  examList: { gap: 12 },
  examChoice: { padding: 14 },
  examChoiceHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  examTitle: { flex: 1, fontSize: 15, lineHeight: 22 },
  examDescription: { fontSize: 14, lineHeight: 22 },
  examMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sourceText: { fontSize: 13, lineHeight: 20 },
});
