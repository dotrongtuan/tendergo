import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  leftAdornment?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  leftAdornment,
}: ButtonProps) {
  const theme = useAppTheme();

  const palette = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: '#ffffff',
      borderColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.heading,
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: '#ffffff',
      borderColor: theme.colors.danger,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.48 : pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        {leftAdornment}
        <Text style={[styles.label, { color: palette.color, fontFamily: theme.typography.label }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 14 },
});
