import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { useAppTheme } from '../theme';

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
}

export function MetricCard({ label, value, helper }: MetricCardProps) {
  const theme = useAppTheme();

  return (
    <Card style={styles.card}>
      <Text style={[styles.label, { color: theme.colors.textMuted, fontFamily: theme.typography.bodyMedium }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.heading, fontFamily: theme.typography.display }]}>{value}</Text>
      {helper ? <Text style={[styles.helper, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{helper}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { fontSize: 28 },
  helper: { fontSize: 13, lineHeight: 20 },
});
