import { StyleSheet, View } from 'react-native';

import { clamp } from '../utils/array';
import { useAppTheme } from '../theme';

interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  const theme = useAppTheme();
  const progress = clamp(value, 0, 100);

  return (
    <View style={[styles.track, { backgroundColor: theme.colors.progressTrack }]}>
      <View style={[styles.fill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});
