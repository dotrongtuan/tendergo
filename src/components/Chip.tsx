import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme';

interface ChipProps {
  label: string;
  tone?: 'primary' | 'accent' | 'success' | 'muted';
}

export function Chip({ label, tone = 'primary' }: ChipProps) {
  const theme = useAppTheme();
  const palette =
    tone === 'accent'
      ? { backgroundColor: theme.colors.accentSoft, color: theme.colors.accent }
      : tone === 'success'
        ? { backgroundColor: `${theme.colors.success}18`, color: theme.colors.success }
        : tone === 'muted'
          ? { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.textMuted }
          : { backgroundColor: theme.colors.chipBackground, color: theme.colors.chipText };

  return (
    <View style={[styles.base, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.color, fontFamily: theme.typography.label }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  label: { fontSize: 12 },
});
