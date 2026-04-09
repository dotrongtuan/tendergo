export interface LessonBlueprint {
  idSuffix: string;
  title: string;
  content: string;
  keyPoints: [string, string, string];
  quickNotes: [string, string, string];
  example?: string;
  references: string[];
  estimatedStudyTime: number;
}

export interface TopicBlueprint {
  id: string;
  code: string;
  name: string;
  shortDescription: string;
  learningObjectives: string[];
  summary: string;
  flashSummary: string[];
  tags: string[];
  order: number;
  lessons: LessonBlueprint[];
}
