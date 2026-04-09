import type {
  ExamCatalogMode,
  ExamExperienceMode,
  QuestionDifficulty,
  ThemeModePreference,
} from '../types/models';

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const shortDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
});

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(value));
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!remainder) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${remainder} phút`;
}

export function formatDurationSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getDifficultyLabel(difficulty: QuestionDifficulty) {
  switch (difficulty) {
    case 'easy':
      return 'Cơ bản';
    case 'medium':
      return 'Trung bình';
    case 'hard':
      return 'Nâng cao';
    default:
      return difficulty;
  }
}

export function getThemeModeLabel(mode: ThemeModePreference) {
  switch (mode) {
    case 'light':
      return 'Sáng';
    case 'dark':
      return 'Tối';
    case 'system':
      return 'Theo hệ thống';
    default:
      return mode;
  }
}

export function getExamCatalogModeLabel(mode: ExamCatalogMode) {
  return mode === 'topic' ? 'Theo chuyên đề' : 'Tổng hợp';
}

export function getExperienceModeLabel(mode: ExamExperienceMode) {
  return mode === 'practice' ? 'Luyện tập' : 'Mô phỏng';
}
