import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useAppTheme } from '../theme';

interface HeroBannerProps {
  eyebrow: string;
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string }>;
}

export function HeroBanner({ eyebrow, title, description, stats = [] }: HeroBannerProps) {
  const theme = useAppTheme();
  const { isTablet } = useResponsiveLayout();

  return (
    <LinearGradient
      colors={
        theme.name === 'dark'
          ? ['#12314a', '#0b1d2f', '#07111d']
          : ['#0f2740', '#1b5d8e', '#3d87bf']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrapper, { padding: isTablet ? 24 : 20 }]}
    >
      <Text style={[styles.eyebrow, { fontFamily: theme.typography.label }]}>{eyebrow}</Text>
      <Text style={[styles.title, { fontFamily: theme.typography.display }]}>{title}</Text>
      <Text style={[styles.description, { fontFamily: theme.typography.body }]}>{description}</Text>
      {stats.length ? (
        <View style={styles.stats}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={[styles.statValue, { fontFamily: theme.typography.heading }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { fontFamily: theme.typography.bodyMedium }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 28, gap: 10 },
  eyebrow: { color: '#b7dcfb', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: '#ffffff', fontSize: 30, lineHeight: 36 },
  description: { color: '#e4edf7', fontSize: 14, lineHeight: 22 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  statCard: {
    minWidth: 118,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    gap: 4,
  },
  statValue: { color: '#ffffff', fontSize: 18 },
  statLabel: { color: '#d7e7f7', fontSize: 12 },
});
