import type { QuestionBankFilters } from '../types/models';

export const APP_NAME = 'TenderGO';
export const PROGRAM_CODE = 'CTBD-DAUTHAU';
export const APP_DISCLAIMER =
  'Du lieu ly thuyet va cau hoi trong ban demo chi la du lieu mau minh hoa, can duoc hoi dong chuyen mon ra soat truoc khi dua vao su dung chinh thuc.';
export const MOCK_SOURCE_LABEL = 'TenderGO mock seed v1';
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
