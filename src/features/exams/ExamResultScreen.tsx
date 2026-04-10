import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { HeroBanner } from '../../components/HeroBanner';
import { MetricCard } from '../../components/MetricCard';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import type { RootStackParamList } from '../../navigation/types';
import { exportExamResultPdf } from '../../services/dataTransferService';
import { buildExamResultDetail, getExamHistoryEntry } from '../../services/examService';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import { formatDateTime, formatDurationSeconds } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ExamResult'>;

function resolveFileName(location: string, fallback: string) {
  const segments = location.split(/[\\/]/).filter(Boolean);
  return segments.at(-1) ?? fallback;
}

export function ExamResultScreen({ navigation, route }: Props) {
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const profile = useAppStore((state) => state.profile);
  const history = useAppStore((state) => state.history);
  const reviewItems = useAppStore((state) => state.reviewMap[route.params.historyId] ?? []);
  const recordTransfer = useAppStore((state) => state.recordTransfer);
  const historyEntry = getExamHistoryEntry(history, route.params.historyId);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  if (!historyEntry) {
    return (
      <AppScreen>
        <PageHeader title="Kết quả bài thi" onBackPress={handleBack} />
        <Card>
          <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>Không tìm thấy bài thi cần xem kết quả.</Text>
        </Card>
      </AppScreen>
    );
  }

  const breakdown = data ? buildExamResultDetail(data, historyEntry) : [];

  const handleExportPdf = async () => {
    if (!data || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const location = await exportExamResultPdf({
        profile,
        catalog: data,
        historyEntry,
        reviewItems,
      });
      const fileName = resolveFileName(location, 'tendergo-exam-result.pdf');
      const message = `Đã tạo PDF kết quả ${fileName}. Trên web, trình duyệt có thể mở hộp thoại in để lưu thành PDF.`;
      setExportStatus(message);
      recordTransfer({
        kind: 'export_exam_result_pdf',
        status: 'success',
        fileName,
        note: `${historyEntry.title} • ${message}`,
      });
    } catch (error) {
      const message = `Xuất PDF thất bại: ${error instanceof Error ? error.message : 'Không rõ lỗi'}`;
      setExportStatus(message);
      recordTransfer({
        kind: 'export_exam_result_pdf',
        status: 'error',
        fileName: 'tendergo-exam-result.pdf',
        note: `${historyEntry.title} • ${message}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppScreen>
      <PageHeader
        eyebrow={historyEntry.scorePercentage >= 75 ? 'Hoàn thành tốt' : 'Cần ôn thêm'}
        title={`Kết quả ${historyEntry.scorePercentage}%`}
        description={`Nộp lúc ${formatDateTime(historyEntry.completedAt)}`}
        onBackPress={handleBack}
      />
      <HeroBanner
        eyebrow={historyEntry.scorePercentage >= 75 ? 'Kết quả bài thi' : 'Cần ôn trọng tâm'}
        title={historyEntry.scorePercentage >= 75 ? 'Bạn đang đi đúng nhịp ôn tập' : 'Cần thêm một vòng ôn trọng tâm'}
        description="Kết quả dưới đây được dùng để cập nhật thống kê cá nhân, chuyên đề yếu và dữ liệu review đáp án."
        stats={[
          { label: 'Điểm', value: `${historyEntry.scorePercentage}%` },
          { label: 'Đúng', value: `${historyEntry.correctCount}/${historyEntry.totalQuestions}` },
          { label: 'Đánh dấu', value: `${historyEntry.flaggedCount}` },
        ]}
      />

      <View style={styles.metrics}>
        <MetricCard label="Số câu đúng" value={`${historyEntry.correctCount}/${historyEntry.totalQuestions}`} />
        <MetricCard label="Câu đánh dấu" value={`${historyEntry.flaggedCount}`} />
        <MetricCard label="Thời gian làm" value={formatDurationSeconds(historyEntry.durationSeconds)} />
      </View>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Breakdown theo chuyên đề</Text>
        {breakdown.map((item) => (
          <View key={item.topicId} style={styles.row}>
            <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>{item.topicCode}</Text>
            <Text style={[styles.body, { color: theme.colors.primary, fontFamily: theme.typography.label }]}>
              {item.correct}/{item.total}
            </Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Gợi ý ôn lại</Text>
        {historyEntry.weakTopicIds.length ? (
          historyEntry.weakTopicIds.map((topicId) => (
            <Text key={topicId} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
              • {data?.topics.find((topic) => topic.id === topicId)?.name ?? topicId}
            </Text>
          ))
        ) : (
          <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>Kết quả đang khá đồng đều, bạn có thể tăng độ khó hoặc chuyển sang đề tổng hợp.</Text>
        )}
      </Card>

      {exportStatus ? (
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Trạng thái export</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{exportStatus}</Text>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button label={isExporting ? 'Đang xuất PDF...' : 'Xuất PDF kết quả'} onPress={handleExportPdf} disabled={!data || isExporting} />
        <Button label="Review đáp án" onPress={() => navigation.navigate('ReviewAnswers', { historyId: historyEntry.id })} variant="secondary" />
        <Button label="Tạo đề tổng hợp mới" onPress={() => navigation.navigate('CompositeExamSetup')} variant="secondary" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  sectionTitle: { fontSize: 17, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22 },
  actions: { gap: 12 },
});
