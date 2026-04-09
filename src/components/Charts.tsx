import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { useAppTheme } from '../theme';
import type { HeatmapCell, TopicAnalyticsRow, TrendPoint } from '../utils/analytics';

export function TrendChart({ title, data }: { title: string; data: TrendPoint[] }) {
  const theme = useAppTheme();
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <Text style={[styles.title, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>{title}</Text>
      <View style={styles.barRow}>
        {data.map((item) => (
          <View key={item.id} style={styles.barItem}>
            <View style={[styles.barTrack, { backgroundColor: theme.colors.progressTrack }]}>
              <View style={[styles.barFill, { height: `${(item.value / maxValue) * 100}%`, backgroundColor: theme.colors.primary }]} />
            </View>
            <Text style={[styles.axisValue, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>{item.value}%</Text>
            <Text style={[styles.axisLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function HeatmapChart({ title, cells }: { title: string; cells: HeatmapCell[] }) {
  const theme = useAppTheme();
  const maxValue = Math.max(...cells.map((cell) => cell.value), 1);

  return (
    <Card>
      <Text style={[styles.title, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>{title}</Text>
      <View style={styles.heatmap}>
        {cells.map((cell) => (
          <View
            key={cell.date}
            style={[
              styles.heatCell,
              {
                backgroundColor: cell.value ? theme.colors.primary : theme.colors.surfaceMuted,
                opacity: cell.value ? Math.min(1, 0.25 + cell.value / maxValue) : 1,
              },
            ]}
          >
            <Text style={[styles.heatLabel, { color: cell.value ? '#ffffff' : theme.colors.textMuted, fontFamily: theme.typography.bodyMedium }]}>
              {cell.label}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function TopicPerformanceList({ rows }: { rows: TopicAnalyticsRow[] }) {
  const theme = useAppTheme();

  return (
    <Card>
      <Text style={[styles.title, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Hiệu suất theo chuyên đề</Text>
      <View style={styles.list}>
        {rows.map((row) => (
          <View key={row.topicId} style={styles.listRow}>
            <View style={styles.listText}>
              <Text style={[styles.rowTitle, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>{row.topicName}</Text>
              <Text style={[styles.rowMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
                {row.correct}/{row.answered || row.totalLessons} đúng • {row.completedLessons}/{row.totalLessons} bài đã học
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: theme.colors.primary, fontFamily: theme.typography.label }]}>{Math.round(row.accuracy)}%</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 17 },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, minHeight: 180 },
  barItem: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { width: '100%', height: 120, borderRadius: 14, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 14 },
  axisValue: { fontSize: 12 },
  axisLabel: { fontSize: 11 },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heatCell: { width: 56, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heatLabel: { fontSize: 11 },
  list: { gap: 12 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  listText: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 14 },
  rowMeta: { fontSize: 12, lineHeight: 18 },
  rowValue: { fontSize: 14 },
});
