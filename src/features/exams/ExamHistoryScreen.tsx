import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

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

type ScoreFilter = 'all' | 'under75' | 'pass' | 'excellent';
type TimeFilter = 'all' | '7d' | '30d' | '90d';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function resolveFileName(location: string, fallback: string) {
  const segments = location.split(/[\\/]/).filter(Boolean);
  return segments.at(-1) ?? fallback;
}

function FilterChip({ label, active, onPress }: FilterChipProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.surfaceMuted,
          borderColor: active ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipLabel,
          {
            color: active ? '#ffffff' : theme.colors.text,
            fontFamily: active ? theme.typography.label : theme.typography.bodyMedium,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
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
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const topicNameMap = useMemo(() => {
    return new Map((data?.topics ?? []).map((topic) => [topic.id, topic.name]));
  }, [data]);

  const availableTopics = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.topics.filter((topic) => history.some((entry) => entry.topicBreakdown.some((item) => item.topicId === topic.id)));
  }, [data, history]);

  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const thresholdByFilter: Record<Exclude<TimeFilter, 'all'>, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    return history.filter((entry) => {
      const matchesTopic =
        selectedTopicId === 'all' || entry.topicBreakdown.some((item) => item.topicId === selectedTopicId);

      const matchesScore =
        scoreFilter === 'all' ||
        (scoreFilter === 'under75' && entry.scorePercentage < 75) ||
        (scoreFilter === 'pass' && entry.scorePercentage >= 75) ||
        (scoreFilter === 'excellent' && entry.scorePercentage >= 90);

      const matchesTime =
        timeFilter === 'all' ||
        now - new Date(entry.completedAt).getTime() <= thresholdByFilter[timeFilter] * 24 * 60 * 60 * 1000;

      return matchesTopic && matchesScore && matchesTime;
    });
  }, [history, scoreFilter, selectedTopicId, timeFilter]);

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

  const filterSummary = useMemo(() => {
    const topicLabel =
      selectedTopicId === 'all' ? 'Tất cả chuyên đề' : availableTopics.find((topic) => topic.id === selectedTopicId)?.name ?? 'Theo chuyên đề';
    const scoreLabel =
      scoreFilter === 'all'
        ? 'Mọi mức điểm'
        : scoreFilter === 'under75'
          ? 'Dưới 75%'
          : scoreFilter === 'pass'
            ? 'Từ 75%'
            : 'Từ 90%';
    const timeLabel = timeFilter === 'all' ? 'Toàn bộ thời gian' : `Trong ${timeFilter.replace('d', '')} ngày gần đây`;

    return `${filteredHistory.length} bài • ${topicLabel} • ${scoreLabel} • ${timeLabel}`;
  }, [availableTopics, filteredHistory.length, scoreFilter, selectedTopicId, timeFilter]);

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
      const message = `Đã tạo PDF kết quả ${fileName}. Trên web, trình duyệt có thể mở hộp thoại in để lưu thành PDF.`;
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
            description="Theo dõi tiến trình đã làm, lọc theo mục tiêu ôn tập và xuất hồ sơ PDF bất cứ lúc nào."
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

          <Card>
            <Text style={[styles.sectionTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
              Bộ lọc lịch sử
            </Text>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.label }]}>
                Chuyên đề
              </Text>
              <View style={styles.chipRow}>
                <FilterChip label="Tất cả" active={selectedTopicId === 'all'} onPress={() => setSelectedTopicId('all')} />
                {availableTopics.map((topic) => (
                  <FilterChip
                    key={topic.id}
                    label={topic.code}
                    active={selectedTopicId === topic.id}
                    onPress={() => setSelectedTopicId(topic.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.label }]}>
                Mức điểm
              </Text>
              <View style={styles.chipRow}>
                <FilterChip label="Tất cả" active={scoreFilter === 'all'} onPress={() => setScoreFilter('all')} />
                <FilterChip label="< 75%" active={scoreFilter === 'under75'} onPress={() => setScoreFilter('under75')} />
                <FilterChip label=">= 75%" active={scoreFilter === 'pass'} onPress={() => setScoreFilter('pass')} />
                <FilterChip label=">= 90%" active={scoreFilter === 'excellent'} onPress={() => setScoreFilter('excellent')} />
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.label }]}>
                Thời gian
              </Text>
              <View style={styles.chipRow}>
                <FilterChip label="Tất cả" active={timeFilter === 'all'} onPress={() => setTimeFilter('all')} />
                <FilterChip label="7 ngày" active={timeFilter === '7d'} onPress={() => setTimeFilter('7d')} />
                <FilterChip label="30 ngày" active={timeFilter === '30d'} onPress={() => setTimeFilter('30d')} />
                <FilterChip label="90 ngày" active={timeFilter === '90d'} onPress={() => setTimeFilter('90d')} />
              </View>
            </View>

            <Text style={[styles.filterSummary, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
              {filterSummary}
            </Text>
          </Card>

          {filteredHistory.length ? (
            filteredHistory.map((entry) => {
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
            })
          ) : (
            <Card>
              <EmptyState
                title="Không có bài phù hợp bộ lọc"
                description="Hãy đổi chuyên đề, mức điểm hoặc khoảng thời gian để xem lại các bài đã làm."
              />
            </Card>
          )}
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
  filterGroup: { gap: 8 },
  filterLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontSize: 12, lineHeight: 16 },
  filterSummary: { fontSize: 12, lineHeight: 18 },
});
