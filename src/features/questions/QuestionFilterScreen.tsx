import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import { questionFilterSchema, type QuestionFilterFormValues } from '../../types/schemas';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionFilter'>;

const difficultyOptions: QuestionFilterFormValues['difficulty'][] = ['all', 'easy', 'medium', 'hard'];
const statusOptions: QuestionFilterFormValues['status'][] = ['all', 'unanswered', 'incorrect', 'bookmarked'];

export function QuestionFilterScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const filters = useAppStore((state) => state.questionBankFilters);
  const updateFilters = useAppStore((state) => state.updateQuestionBankFilters);
  const resetQuestionBankFilters = useAppStore((state) => state.resetQuestionBankFilters);
  const { control, handleSubmit, setValue, watch } = useForm<QuestionFilterFormValues>({
    resolver: zodResolver(questionFilterSchema),
    defaultValues: filters,
  });
  const values = watch();

  return (
    <AppScreen>
      <PageHeader title="Bộ lọc câu hỏi" description="Áp dụng bộ lọc để thu hẹp ngân hàng câu hỏi." onBackPress={() => navigation.goBack()} />
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Chuyên đề</Text>
        <View style={styles.wrap}>
          <Button label="Tất cả" onPress={() => setValue('topicId', undefined)} variant={!values.topicId ? 'primary' : 'secondary'} />
          {data?.topics.map((topic) => (
            <View key={topic.id}>
              <Button
                label={topic.code}
                onPress={() => setValue('topicId', values.topicId === topic.id ? undefined : topic.id)}
                variant={values.topicId === topic.id ? 'primary' : 'secondary'}
              />
            </View>
          ))}
        </View>
      </Card>
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Độ khó</Text>
        <View style={styles.wrap}>
          {difficultyOptions.map((option) => (
            <Button
              key={option}
              label={option}
              onPress={() => setValue('difficulty', option)}
              variant={values.difficulty === option ? 'primary' : 'secondary'}
            />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Trạng thái</Text>
        <View style={styles.wrap}>
          {statusOptions.map((option) => (
            <Button
              key={option}
              label={option}
              onPress={() => setValue('status', option)}
              variant={values.status === option ? 'primary' : 'secondary'}
            />
          ))}
        </View>
        <Controller
          control={control}
          name="bookmarkedOnly"
          render={({ field: { value, onChange } }) => (
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text, fontFamily: theme.typography.body }]}>Chỉ hiển thị câu đã bookmark</Text>
              <Switch value={value} onValueChange={onChange} />
            </View>
          )}
        />
      </Card>
      <View style={styles.actions}>
        <Button
          label="Đặt lại"
          onPress={() => {
            resetQuestionBankFilters();
            navigation.goBack();
          }}
          variant="secondary"
        />
        <Button
          label="Áp dụng"
          onPress={handleSubmit((payload) => {
            updateFilters(payload);
            navigation.goBack();
          })}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  switchLabel: { fontSize: 14 },
  actions: { gap: 12 },
});
