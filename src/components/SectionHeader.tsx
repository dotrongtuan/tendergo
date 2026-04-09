import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onPressAction }: SectionHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel && onPressAction ? (
        <Pressable onPress={onPressAction}>
          <Text style={[styles.action, { color: theme.colors.primary, fontFamily: theme.typography.label }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  content: { flex: 1, gap: 4 },
  title: { fontSize: 18 },
  subtitle: { fontSize: 13, lineHeight: 20 },
  action: { fontSize: 13 },
});
