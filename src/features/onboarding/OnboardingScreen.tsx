import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { HeroBanner } from '../../components/HeroBanner';
import { PageHeader } from '../../components/PageHeader';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';

const highlights = [
  {
    title: 'Học theo chuyên đề',
    description: 'Mỗi chuyên đề gồm lý thuyết phân cấp, ghi nhớ nhanh và tóm tắt cuối bài.',
  },
  {
    title: 'Thi thử có logic thật',
    description: 'Hỗ trợ practice mode, exam simulation, lưu tạm tiến trình và tự nộp khi hết giờ.',
  },
  {
    title: 'Phân tích tiến độ',
    description: 'Theo dõi điểm mạnh, điểm yếu, lịch sử làm bài và khuyến nghị nội dung cần ôn lại.',
  },
];

export function OnboardingScreen() {
  const theme = useAppTheme();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return (
    <AppScreen>
      <PageHeader
        eyebrow="TenderGO"
        title="Nền tảng ôn thi đấu thầu đa nền tảng"
        description="Phiên bản MVP này tập trung vào luồng học, ôn tập, thi thử và quản trị dữ liệu offline bằng seed data."
      />
      <HeroBanner
        eyebrow="MVP production-ready"
        title="Học, luyện đề, theo dõi tiến độ trong một app duy nhất"
        description="Kiến trúc hiện tại đã chuẩn bị sẵn cho backend, CMS ngân hàng câu hỏi và mở rộng sang nhiều chương trình bồi dưỡng khác."
        stats={[
          { label: 'Offline', value: 'Có' },
          { label: 'Mock data', value: '162 câu' },
          { label: 'Mở rộng web', value: 'Sẵn' },
        ]}
      />
      {highlights.map((item) => (
        <Card key={item.title}>
          <Text style={[styles.cardTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>{item.title}</Text>
          <Text style={[styles.cardDescription, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{item.description}</Text>
        </Card>
      ))}
      <View style={styles.actions}>
        <Button label="Bắt đầu thiết lập" onPress={completeOnboarding} fullWidth />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 17 },
  cardDescription: { fontSize: 14, lineHeight: 22 },
  actions: { marginTop: 8 },
});
