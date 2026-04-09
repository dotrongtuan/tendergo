import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { APP_NAME } from '../constants/app';

export function AppLoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Khởi tạo nền tảng ôn thi</Text>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.description}>Đang tải dữ liệu học tập offline, giao diện và lịch sử luyện đề.</Text>
      <ActivityIndicator size="small" color="#d9b06c" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0f2740',
    gap: 10,
  },
  eyebrow: { color: '#9ec7e7', fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#ffffff', fontSize: 34, fontWeight: '700' },
  description: { color: '#d5dfeb', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 8 },
});
