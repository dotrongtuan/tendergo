import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  onBackPress?: () => void;
  rightActionIcon?: keyof typeof Ionicons.glyphMap;
  onRightActionPress?: () => void;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  onBackPress,
  rightActionIcon,
  onRightActionPress,
}: PageHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        {onBackPress ? (
          <Pressable onPress={onBackPress} style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="arrow-back-outline" size={18} color={theme.colors.heading} />
          </Pressable>
        ) : (
          <View />
        )}
        {rightActionIcon && onRightActionPress ? (
          <Pressable onPress={onRightActionPress} style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name={rightActionIcon} size={18} color={theme.colors.heading} />
          </Pressable>
        ) : (
          <View />
        )}
      </View>
      <View style={styles.content}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: theme.colors.primary, fontFamily: theme.typography.label }]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, { color: theme.colors.heading, fontFamily: theme.typography.display }]}>{title}</Text>
        {description ? <Text style={[styles.description, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{description}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { gap: 6 },
  eyebrow: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontSize: 30, lineHeight: 36 },
  description: { fontSize: 14, lineHeight: 22 },
});
