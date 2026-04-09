import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { useRootNavigation } from '../../navigation/helpers';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';

const themeModes = ['system', 'light', 'dark'] as const;
const themeModeLabels: Record<(typeof themeModes)[number], string> = {
  system: 'Hệ thống',
  light: 'Sáng',
  dark: 'Tối',
};

export function SettingsScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const preferences = useAppStore((state) => state.preferences);
  const updateThemeMode = useAppStore((state) => state.updateThemeMode);
  const setRemindersEnabled = useAppStore((state) => state.setRemindersEnabled);
  const resetToSeed = useAppStore((state) => state.resetToSeed);
  const signOut = useAppStore((state) => state.signOut);

  return (
    <AppScreen>
      <PageHeader
        title="Cài đặt"
        description="Tùy chỉnh giao diện, nhắc nhở và dữ liệu demo."
        onBackPress={() => navigation.goBack()}
      />
      <Card>
        <Text style={[styles.label, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
          Chế độ giao diện
        </Text>
        <View style={styles.wrap}>
          {themeModes.map((mode) => (
            <Button
              key={mode}
              label={themeModeLabels[mode]}
              onPress={() => updateThemeMode(mode)}
              variant={preferences.themeMode === mode ? 'primary' : 'secondary'}
            />
          ))}
        </View>
      </Card>
      <Card>
        <View style={styles.switchRow}>
          <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
            Nhắc nhở ôn tập
          </Text>
          <Switch
            value={preferences.remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ false: theme.colors.progressTrack, true: theme.colors.primary }}
            thumbColor={preferences.remindersEnabled ? '#ffffff' : '#f5f7fa'}
          />
        </View>
      </Card>
      <View style={styles.actions}>
        <Button
          label="Khôi phục dữ liệu mẫu"
          onPress={() =>
            Alert.alert(
              'Khôi phục dữ liệu',
              'Toàn bộ tiến độ local sẽ trở về trạng thái seed ban đầu.',
              [
                { text: 'Hủy' },
                { text: 'Khôi phục', style: 'destructive', onPress: resetToSeed },
              ],
            )
          }
          variant="danger"
        />
        <Button label="Thoát phiên hiện tại" onPress={signOut} variant="secondary" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 10 },
  body: { fontSize: 14 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { gap: 12 },
});
