import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { APP_NAME } from '../constants/app';

interface AppBootstrapErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export function AppBootstrapErrorScreen({ message, onRetry }: AppBootstrapErrorScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Khoi tao gap su co</Text>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.description}>
        Ung dung khong the nap day du tai nguyen can thiet. Ban co the thu lai de tiep tuc.
      </Text>
      <View style={styles.messageCard}>
        <Text style={styles.message}>{message}</Text>
      </View>
      <Button label="Thu lai" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#102030',
    gap: 14,
  },
  eyebrow: { color: '#f0c27b', fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { color: '#ffffff', fontSize: 34, fontWeight: '700' },
  description: { color: '#d5dfeb', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  messageCard: {
    width: '100%',
    maxWidth: 520,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  message: { color: '#f2f6fb', fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
