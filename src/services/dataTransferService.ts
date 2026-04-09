import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { snapshotSchema } from '../types/schemas';
import type { AppSnapshot } from '../types/models';

function buildFileName() {
  return `tendergo-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
}

export async function exportSnapshotFile(snapshot: AppSnapshot) {
  const payload = JSON.stringify(snapshot, null, 2);

  if (Platform.OS === 'web') {
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = buildFileName();
    anchor.click();
    URL.revokeObjectURL(url);
    return buildFileName();
  }

  const directory = FileSystem.documentDirectory;

  if (!directory) {
    throw new Error('Không tìm thấy thư mục lưu trữ cục bộ.');
  }

  const fileUri = `${directory}${buildFileName()}`;
  await FileSystem.writeAsStringAsync(fileUri, payload);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }

  return fileUri;
}

export async function importSnapshotFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json'],
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];

  if (!asset) {
    return null;
  }

  const content =
    Platform.OS === 'web'
      ? await fetch(asset.uri).then((response) => response.text())
      : await FileSystem.readAsStringAsync(asset.uri);

  return snapshotSchema.parse(JSON.parse(content));
}
