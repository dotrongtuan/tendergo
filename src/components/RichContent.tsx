import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme';

interface RichContentProps {
  content: string;
}

export function RichContent({ content }: RichContentProps) {
  const theme = useAppTheme();
  const lines = content.split('\n').filter((line) => line.trim().length > 0);

  return (
    <View style={styles.wrapper}>
      {lines.map((line, index) => {
        if (line.startsWith('## ')) {
          return (
            <Text key={`${line}-${index}`} style={[styles.heading, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
              {line.replace('## ', '')}
            </Text>
          );
        }

        if (line.startsWith('- ')) {
          return (
            <View key={`${line}-${index}`} style={styles.bulletRow}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>{line.replace('- ', '')}</Text>
            </View>
          );
        }

        return (
          <Text key={`${line}-${index}`} style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
            {line}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  heading: { fontSize: 17, marginTop: 4 },
  body: { fontSize: 14, lineHeight: 22, flex: 1 },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 999, marginTop: 8 },
});
