import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { authFormSchema, type AuthFormValues } from '../../types/schemas';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';

export function AuthGatewayScreen() {
  const theme = useAppTheme();
  const startGuestMode = useAppStore((state) => state.startGuestMode);
  const startMockLogin = useAppStore((state) => state.startMockLogin);
  const {
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      displayName: 'Học viên nội bộ',
      learningGoal: 'Ôn hết các chuyên đề và luyện đề tổng hợp ít nhất 3 lần mỗi tuần.',
    },
  });

  const displayName = watch('displayName');
  const learningGoal = watch('learningGoal');

  return (
    <AppScreen>
      <PageHeader
        eyebrow="Khởi động phiên học"
        title="Chọn chế độ trải nghiệm"
        description="Bạn có thể vào app ngay ở chế độ khách hoặc dùng mock login để lưu tên hiển thị và mục tiêu học tập."
      />
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Tên hiển thị</Text>
        <TextInput
          value={displayName}
          onChangeText={(value) => setValue('displayName', value)}
          style={[styles.input, { color: theme.colors.heading, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted, fontFamily: theme.typography.body }]}
          placeholder="Nhập tên học viên"
          placeholderTextColor={theme.colors.textMuted}
        />
        {errors.displayName ? <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.displayName.message}</Text> : null}

        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>Mục tiêu học tập</Text>
        <TextInput
          multiline
          numberOfLines={4}
          value={learningGoal}
          onChangeText={(value) => setValue('learningGoal', value)}
          style={[styles.input, styles.textarea, { color: theme.colors.heading, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted, fontFamily: theme.typography.body }]}
          placeholder="Ví dụ: đạt 80% đề tổng hợp trước ngày thi"
          placeholderTextColor={theme.colors.textMuted}
        />
        {errors.learningGoal ? <Text style={[styles.error, { color: theme.colors.danger }]}>{errors.learningGoal.message}</Text> : null}

        <View style={styles.actions}>
          <Button label="Vào với Guest mode" onPress={startGuestMode} variant="secondary" />
          <Button label="Dùng mock login" onPress={handleSubmit(startMockLogin)} />
        </View>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  actions: { gap: 12, marginTop: 8 },
  error: { fontSize: 12 },
});
