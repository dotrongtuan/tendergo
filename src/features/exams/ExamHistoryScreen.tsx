import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { HeroBanner } from '../../components/HeroBanner';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useRootNavigation } from '../../navigation/helpers';
import { exportExamResultPdf } from '../../services/dataTransferService';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import { formatDateTime, formatDurationSeconds, getExamCatalogModeLabel, getExperienceModeLabel } from '../../utils/format';

function resolveFileName(location: string, fallback: string) {
  const segments = location.split(/[\\/]/).filter(Boolean);
  return segments.at(-1) ?? fallback;
}

export function ExamHistoryScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const profile = useAppStore((state) => state.profile);
  const history = useAppStore((state) => state.history);
  const reviewMap = useAppStore((state) => state.reviewMap);
  const recordTransfer = useAppStore((state) => state.recordTransfer);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const topicNameMap = useMemo(() => {
    return new Map((data?.topics ?? []).map((topic) => [topic.id, topic.name]));
  }, [data]);

  const overview = useMemo(() => {
    const attemptCount = history.length;
    const averageScore = attemptCount
      ? Math.round(history.reduce((total, entry) => total + entry.scorePercentage, 0) / attemptCount)
      : 0;
    const bestScore = history.reduce((best, entry) => Math.max(best, entry.scorePercentage), 0);
    const reviewReadyCount = history.filter((entry) => Boolean(reviewMap[entry.id]?.length)).length;

    return {
      attemptCount,
      averageScore,
      bestScore,
      reviewReadyCount,
    };
  }, [history, reviewMap]);

  const handleExportPdf = async (historyId: string) => {
    if (!data || exportingId) {
      return;
    }

    const historyEntry = history.find((entry) => entry.id === historyId);

    if (!historyEntry) {
      return;
    }

    setExportingId(historyId);

    try {
      const location = await exportExamResultPdf({
        profile,
        catalog: data,
        historyEntry,
        reviewItems: reviewMap[historyId] ?? [],
      });
      const fileName = resolveFileName(location, 'tendergo-exam-result.pdf');
      const message = `Đã tạo PDF kết quả ${fileName}.`;
      setStatus(`${historyEntry.title} • ${message}`);
      recordTransfer({
        kind: 'export_exam_result_pdf',
        status: 'success',
        fileName,
        note: `${historyEntry.title} • ${message}`,
      });
    } catch (error) {
      const message = `Xuất PDF thất bại: ${error instanceof Error ? error.message : 'Không rõ lỗi'}`;
      setStatus(`${historyEntry.title} • ${message}`);
      recordTransfer({
        kind: 'export_exam_result_pdf',
        status: 'error',
        fileName: 'tendergo-exam-result.pdf',
        note: `${historyEntry.title} • ${message}`,
      });
    } finally {
      setExportingId(null);
    }
  };

  return (
    <AppScreen>
      <PageHeader
        eyebrow={profile.displayName}
        title="Lịch sử thi"
        description="Mở lại kết quả, review đáp án và xuất PDF cho mọi bài thi đã lưu trên thiết bị."
        onBackPress={() => navigation.goBack()}
      />

      {history.length ? (
        <>
          <HeroBanner
            eyebrow="Kho kết quả cá nhân"
            title="Tất cả bài thi của bạn ở một nơi"
            description="Theo dõi tiến trình đã làm, mở lại chi tiết từng bài và xuất hồ sơ PDF bất cứ lúc nào."
            stats={[
              { label: 'Lượt làm', value: `${overview.attemptCount}` },
              { label: 'Điểm TB', value: `${overview.averageScore}%` },
              { label: 'Điểm cao nhất', value: `${overview.bestScore}%` },
            ]}
          />

          {status ? (
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
                Trạng thái gần nhất
              </Text>
              <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{status}</Text>
            </Card>
          ) : null}

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
              Tóm tắt nhanh
            </Text>
            <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
              • {overview.attemptCount} lượt làm bài đã được lưu cục bộ.
            </Text>
            <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
              • {overview.reviewReadyCount} bài có dữ liệu review chi tiết để đưa vào PDF đầy đủ.
            </Text>
            <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
              • Điểm trung bình hiện tại là {overview.averageScore}% và điểm cao nhất là {overview.bestScore}%.
            </Text>
          </Card>

          {history.map((entry) => {
            const weakTopics = entry.weakTopicIds
              .map((topicId) => topicNameMap.get(topicId) ?? topicId)
              .slice(0, 3)
              .join(', ');

            return (
              <Card key={entry.id}>
                <View style={styles.headerRow}>
                  <View style={styles.headerMain}>
                    <Text style={[styles.rowTitle, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
                      {entry.title}
                    </Text>
                    <Text style={[styles.rowMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
                      {formatDateTime(entry.completedAt)} • {getExamCatalogModeLabel(entry.catalogMode)} • {getExperienceModeLabel(entry.experienceMode)}
                    </Text>
                  </View>
                  <Text style={[styles.score, { color: theme.colors.primary, fontFamily: theme.typography.heading }]}>
                    {entry.scorePercentage}%
                  </Text>
                </View>

                <View style={styles.metaGrid}>
                  <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
                    Đúng: {entry.correctCount}/{entry.totalQuestions}
                  </Text>
                  <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
                    Thời gian: {formatDurationSeconds(entry.durationSeconds)}
                  </Text>
                </View>

                <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
                  {weakTopics ? `Cần ôn lại: ${weakTopics}` : 'Kết quả khá đồng đều, có thể tiếp tục nâng độ khó.'}
                </Text>

                <View style={styles.actions}>
                  <Button label="Xem kết quả" onPress={() => navigation.navigate('ExamResult', { historyId: entry.id })} />
                  <Button
                    label={exportingId === entry.id ? 'Đang xuất PDF...' : 'Xuất PDF'}
                    onPress={() => handleExportPdf(entry.id)}
                    variant="secondary"
                    disabled={!data || exportingId !== null}
                  />
                </View>
              </Card>
            );
          })}
        </>
      ) : (
        <EmptyState
          title="Chưa có lịch sử thi"
          description="Khi bạn hoàn thành bài thi đầu tiên, màn hình này sẽ lưu toàn bộ kết quả để xem lại và xuất PDF."
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 17, marginBottom: 4 },
  body: { fontSize: 14, lineHeight: 22 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  headerMain: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15, lineHeight: 22 },
  rowMeta: { fontSize: 12, lineHeight: 18 },
  score: { fontSize: 22 },
  metaGrid: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
});
