import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../../components/AppScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { MetricCard } from '../../components/MetricCard';
import { PageHeader } from '../../components/PageHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { useCatalogQuery } from '../../hooks/useCatalogQueries';
import { useRootNavigation } from '../../navigation/helpers';
import {
  exportAdminReportPdf,
  exportExamHistoryCsv,
  exportQuestionBankCsv,
  exportSnapshotFile,
  exportTopicCatalogCsv,
  importSnapshotFile,
} from '../../services/dataTransferService';
import { useAppStore } from '../../store/useAppStore';
import { useAppTheme } from '../../theme';
import { formatDateTime, getExamCatalogModeLabel, getExperienceModeLabel } from '../../utils/format';

function resolveFileName(location: string, fallback: string) {
  const segments = location.split(/[\\/]/).filter(Boolean);
  return segments.at(-1) ?? fallback;
}

const transferKindLabels = {
  import_snapshot: 'Import snapshot',
  export_snapshot: 'Export snapshot',
  export_question_bank_csv: 'Xuất CSV ngân hàng câu hỏi',
  export_exam_history_csv: 'Xuất CSV lịch sử ôn tập',
  export_topic_catalog_csv: 'Xuất CSV danh mục chuyên đề',
  export_admin_report_pdf: 'Xuất báo cáo PDF',
} as const;

export function ImportExportScreen() {
  const navigation = useRootNavigation();
  const theme = useAppTheme();
  const { data } = useCatalogQuery();
  const history = useAppStore((state) => state.history);
  const profile = useAppStore((state) => state.profile);
  const transferHistory = useAppStore((state) => state.transferHistory);
  const buildSnapshot = useAppStore((state) => state.buildSnapshot);
  const importSnapshot = useAppStore((state) => state.importSnapshot);
  const recordTransfer = useAppStore((state) => state.recordTransfer);
  const [status, setStatus] = useState<string>('Chưa thực hiện thao tác import/export nào trong phiên hiện tại.');

  const overview = useMemo(() => {
    if (!data) {
      return null;
    }

    const sourceTopics = data.topics.filter((topic) => topic.sourceDocument);
    const sourceExams = data.exams.filter((exam) => exam.sourceFile);
    const importedFiles = sourceTopics
      .map((topic) => topic.sourceDocument?.fileName)
      .filter((value): value is string => Boolean(value));

    return {
      sourceTopics,
      sourceExams,
      importedFiles,
      importedQuestionCount: data.questions.filter((question) => !question.source.includes('fallback')).length,
      recentHistory: history.slice(0, 5),
      recentTransfers: transferHistory.slice(0, 6),
    };
  }, [data, history, transferHistory]);

  const handleExport = async (
    kind: keyof typeof transferKindLabels,
    fallbackFileName: string,
    action: () => Promise<string>,
    successMessage: (fileName: string) => string,
  ) => {
    try {
      const location = await action();
      const fileName = resolveFileName(location, fallbackFileName);
      const message = successMessage(fileName);
      setStatus(message);
      recordTransfer({
        kind,
        status: 'success',
        fileName,
        note: message,
      });
    } catch (error) {
      const message = `Thao tác thất bại: ${error instanceof Error ? error.message : 'Không rõ lỗi'}`;
      setStatus(message);
      recordTransfer({
        kind,
        status: 'error',
        fileName: fallbackFileName,
        note: message,
      });
    }
  };

  return (
    <AppScreen>
      <PageHeader
        title="Trung tâm dữ liệu"
        description="Khu vực admin-ready để theo dõi seed nội dung, xuất CSV phục vụ rà soát nghiệp vụ và import/export dữ liệu local."
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.metrics}>
        <MetricCard label="Chuyên đề" value={`${data?.topics.length ?? 0}`} helper="Danh mục đang nạp trong app" />
        <MetricCard label="Câu hỏi thật" value={`${overview?.importedQuestionCount ?? 0}`} helper="Không tính fallback seed" />
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Đề thi" value={`${data?.exams.length ?? 0}`} helper="Gồm đề nguồn và đề sinh" />
        <MetricCard label="Lịch sử thi" value={`${history.length}`} helper="Lưu cục bộ trên thiết bị" />
      </View>
      <Card>
        <SectionHeader title="Nguồn dữ liệu đang dùng" subtitle="Tổng hợp cho quản trị nội dung" />
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
          • {overview?.sourceTopics.length ?? 0} chuyên đề đã gắn file nguồn trực tiếp.
        </Text>
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
          • {overview?.sourceExams.length ?? 0} bộ đề tổng hợp lấy từ file DOCX nguồn.
        </Text>
        <Text style={[styles.body, { color: theme.colors.text, fontFamily: theme.typography.body }]}>
          • {data?.lessons.length ?? 0} bài học và {data?.questions.length ?? 0} câu hỏi đang sẵn sàng cho app offline.
        </Text>
        {overview?.importedFiles.length ? (
          <>
            <Text style={[styles.subTitle, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
              File nguồn đã nạp
            </Text>
            {overview.importedFiles.map((fileName) => (
              <Text key={fileName} style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
                • {fileName}
              </Text>
            ))}
          </>
        ) : null}
      </Card>
      <Card>
        <SectionHeader title="Xuất dữ liệu nội bộ" subtitle="CSV mở được bằng Excel để rà soát hoặc nhập sang hệ khác" />
        <View style={styles.actions}>
          <Button
            label="Export snapshot JSON"
            onPress={() =>
              handleExport('export_snapshot', 'tendergo-snapshot.json', () => exportSnapshotFile(buildSnapshot()), (fileName) => `Đã export snapshot tới ${fileName}.`)
            }
          />
          <Button
            label="Xuất báo cáo PDF"
            variant="secondary"
            onPress={() =>
              data
                ? handleExport(
                    'export_admin_report_pdf',
                    'tendergo-admin-report.pdf',
                    () =>
                      exportAdminReportPdf({
                        profile,
                        catalog: data,
                        history,
                        transferHistory,
                      }),
                    (fileName) =>
                      `Đã tạo báo cáo PDF ${fileName}. Trên web, trình duyệt có thể mở hộp thoại in để lưu thành PDF.`,
                  )
                : undefined
            }
            disabled={!data}
          />
          <Button
            label="Export ngân hàng câu hỏi CSV"
            variant="secondary"
            onPress={() =>
              data
                ? handleExport(
                    'export_question_bank_csv',
                    'tendergo-question-bank.csv',
                    () => exportQuestionBankCsv(data),
                    (fileName) => `Đã export ngân hàng câu hỏi tới ${fileName}.`,
                  )
                : undefined
            }
            disabled={!data}
          />
          <Button
            label="Export lịch sử ôn tập CSV"
            variant="secondary"
            onPress={() =>
              data
                ? handleExport(
                    'export_exam_history_csv',
                    'tendergo-exam-history.csv',
                    () => exportExamHistoryCsv(history, data),
                    (fileName) => `Đã export lịch sử ôn tập tới ${fileName}.`,
                  )
                : undefined
            }
            disabled={!data}
          />
          <Button
            label="Export danh mục chuyên đề CSV"
            variant="secondary"
            onPress={() =>
              data
                ? handleExport(
                    'export_topic_catalog_csv',
                    'tendergo-topic-catalog.csv',
                    () => exportTopicCatalogCsv(data),
                    (fileName) => `Đã export danh mục chuyên đề tới ${fileName}.`,
                  )
                : undefined
            }
            disabled={!data}
          />
        </View>
      </Card>
      <Card>
        <SectionHeader title="Nhập dữ liệu local" subtitle="Phục vụ khôi phục và nhập lịch sử học đã backup" />
        <Button
          label="Import snapshot JSON"
          variant="secondary"
          onPress={async () => {
            try {
              const payload = await importSnapshotFile();
              if (!payload) {
                const message = 'Đã hủy import snapshot.';
                setStatus(message);
                recordTransfer({
                  kind: 'import_snapshot',
                  status: 'canceled',
                  fileName: 'snapshot-json',
                  note: message,
                });
                return;
              }

              importSnapshot(payload);
              const message = `Đã import snapshot export lúc ${formatDateTime(payload.exportedAt)}.`;
              setStatus(message);
              recordTransfer({
                kind: 'import_snapshot',
                status: 'success',
                fileName: 'snapshot-json',
                note: message,
              });
            } catch (error) {
              const message = `Import thất bại: ${error instanceof Error ? error.message : 'Không rõ lỗi'}`;
              setStatus(message);
              recordTransfer({
                kind: 'import_snapshot',
                status: 'error',
                fileName: 'snapshot-json',
                note: message,
              });
            }
          }}
        />
      </Card>
      <Card>
        <Text style={[styles.statusTitle, { color: theme.colors.heading, fontFamily: theme.typography.heading }]}>
          Trạng thái gần nhất
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>{status}</Text>
      </Card>
      <Card>
        <SectionHeader title="Lịch sử thao tác dữ liệu" subtitle="Audit trail cục bộ cho import/export" />
        {overview?.recentTransfers.length ? (
          overview.recentTransfers.map((item) => (
            <View key={item.id} style={styles.listRow}>
              <View style={styles.listMain}>
                <Text style={[styles.rowTitle, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
                  {transferKindLabels[item.kind]}
                </Text>
                <Text style={[styles.rowMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
                  {formatDateTime(item.createdAt)} • {item.fileName} • {item.status}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            title="Chưa có thao tác dữ liệu"
            description="Sau khi import/export, hệ thống sẽ lưu dấu vết thao tác gần nhất tại đây."
          />
        )}
      </Card>
      <Card>
        <SectionHeader title="Lịch sử thi gần nhất" subtitle="Giúp admin rà soát dữ liệu kết quả đang lưu trên thiết bị" />
        {overview?.recentHistory.length ? (
          overview.recentHistory.map((entry) => (
            <View key={entry.id} style={styles.listRow}>
              <View style={styles.listMain}>
                <Text style={[styles.rowTitle, { color: theme.colors.heading, fontFamily: theme.typography.label }]}>
                  {entry.title}
                </Text>
                <Text style={[styles.rowMeta, { color: theme.colors.textMuted, fontFamily: theme.typography.body }]}>
                  {getExamCatalogModeLabel(entry.catalogMode)} • {getExperienceModeLabel(entry.experienceMode)} • {formatDateTime(entry.completedAt)}
                </Text>
              </View>
              <Text style={[styles.score, { color: theme.colors.primary, fontFamily: theme.typography.heading }]}>
                {entry.scorePercentage}%
              </Text>
            </View>
          ))
        ) : (
          <EmptyState
            title="Chưa có lịch sử thi"
            description="Khi học viên làm bài, kết quả sẽ xuất hiện tại đây để phục vụ export và rà soát."
          />
        )}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  body: { fontSize: 14, lineHeight: 22 },
  subTitle: { fontSize: 14, marginTop: 4 },
  statusTitle: { fontSize: 17, marginBottom: 8 },
  actions: { gap: 12 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  listMain: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14, lineHeight: 20 },
  rowMeta: { fontSize: 12, lineHeight: 18 },
  score: { fontSize: 18 },
});
