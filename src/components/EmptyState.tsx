import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Card } from './Card';
import { useAppTheme } from '../theme';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onPressAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onPressAction }: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{description}</Text>
      </View>
      {actionLabel && onPressAction ? <Button label={actionLabel} onPress={onPressAction} variant="secondary" /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: 28 },
  content: { gap: 8, alignItems: 'center' },
  title: { fontSize: 18, textAlign: 'center' },
  description: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
