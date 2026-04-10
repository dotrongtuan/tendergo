import type { QuestionBankFilters } from '../types/models';

export const APP_NAME = 'TenderGO';
export const APP_TAGLINE = 'Nền tảng ôn thi và đánh giá năng lực đấu thầu';
export const PROGRAM_CODE = 'CTBD-DAUTHAU';
export const APP_DISCLAIMER =
  'Dữ liệu lý thuyết và câu hỏi trong ứng dụng được tích hợp từ tài liệu chuyên đề do người dùng cung cấp. Khi đưa vào sử dụng chính thức, cần tiếp tục đối chiếu văn bản pháp luật hiện hành và được hội đồng chuyên môn rà soát.';
export const MOCK_SOURCE_LABEL = 'TenderGO fallback generated seed';
export const SNAPSHOT_VERSION = '1.0.0';

export const OPTION_IDS = ['A', 'B', 'C', 'D'] as const;

export const DEFAULT_QUESTION_BANK_FILTERS: QuestionBankFilters = {
  difficulty: 'all',
  status: 'all',
  bookmarkedOnly: false,
  searchText: '',
};

export const DEFAULT_EXAM_CONFIG = {
  defaultQuestionCount: 20,
  defaultDurationMinutes: 30,
  revealAnswersInstantly: true,
};

export const ANALYTICS_HEATMAP_DAYS = 21;
