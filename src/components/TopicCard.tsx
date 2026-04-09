import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { Chip } from './Chip';
import { ProgressBar } from './ProgressBar';
import { useAppTheme } from '../theme';

interface TopicCardProps {
  code: string;
  title: string;
  description: string;
  tags: string[];
  progress: number;
  onPress: () => void;
}

export function TopicCard({ code, title, description, tags, progress, onPress }: TopicCardProps) {
  const theme = useAppTheme();

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Chip label={code} />
        <Text style={[styles.progress, { color: theme.colors.primary, fontFamily: theme.typography.label }]}>
          {Math.round(progress)}%
        </Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{description}</Text>
      <ProgressBar value={progress} />
      <View style={styles.tags}>
        {tags.slice(0, 3).map((tag) => (
          <Chip key={tag} label={tag} tone="muted" />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, lineHeight: 24 },
  description: { fontSize: 14, lineHeight: 22 },
  progress: { fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
