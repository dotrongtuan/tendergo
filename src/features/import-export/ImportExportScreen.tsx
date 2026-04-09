import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useRootNavigation } from '../../navigation/helpers';
import { exportSnapshotFile, importSnapshotFile } from '../../services/dataTransferService';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';

export function ImportExportScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const buildSnapshot = useAppStore((state) => state.buildSnapshot);
  const importSnapshot = useAppStore((state) => state.importSnapshot);
  const [status, setStatus] = useState<string>('Chưa thực hiện thao tác import/export.');

  return (
    <AppScreen>
      <PageHeader title="Import / Export dữ liệu" description="Phục vụ backup local, di chuyển dữ liệu và chuẩn bị cho luồng admin-ready." onBackPress={() => navigation.goBack()} />
      <Card>
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>• {data?.topics.length ?? 0} chuyên đề</Text>
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>• {data?.lessons.length ?? 0} bài học</Text>
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>• {data?.questions.length ?? 0} câu hỏi seed</Text>
      </Card>
      <Button
        label="Export snapshot JSON"
        onPress={async () => {
          try {
            const location = await exportSnapshotFile(buildSnapshot());
            setStatus(`Đã export dữ liệu tới: ${location}`);
          } catch (error) {
            setStatus(`Export thất bại: ${error instanceof Error ? error.message : 'Không rõ lỗi'}`);
          }
        }}
      />
      <Button
        label="Import snapshot JSON"
        variant="secondary"
        onPress={async () => {
          try {
            const payload = await importSnapshotFile();
            if (!payload) {
              setStatus('Đã hủy import.');
              return;
            }
            importSnapshot(payload);
            setStatus(`Đã import dữ liệu lúc ${payload.exportedAt}.`);
          } catch (error) {
            setStatus(`Import thất bại: ${error instanceof Error ? error.message : 'Không rõ lỗi'}`);
          }
        }}
      />
      <Card>
        <Text style={[styles.statusTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>Trạng thái gần nhất</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{status}</Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, lineHeight: 22 },
  statusTitle: { fontSize: 17, marginBottom: 8 },
});
