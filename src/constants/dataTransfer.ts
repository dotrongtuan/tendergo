import type { DataTransferKind } from '../types/models';

export const dataTransferKindLabels: Record<DataTransferKind, string> = {
  import_snapshot: 'Import snapshot',
  export_snapshot: 'Export snapshot',
  export_question_bank_csv: 'Xuất CSV ngân hàng câu hỏi',
  export_exam_history_csv: 'Xuất CSV lịch sử ôn tập',
  export_topic_catalog_csv: 'Xuất CSV danh mục chuyên đề',
  export_admin_report_pdf: 'Xuất báo cáo PDF quản trị',
  export_exam_result_pdf: 'Xuất PDF kết quả bài thi',
};
