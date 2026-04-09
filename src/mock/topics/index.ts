import { topicSetA } from './topicSetA';
import { topicSetB } from './topicSetB';
import { topicSetC } from './topicSetC';

export type { LessonBlueprint, TopicBlueprint } from './types';

export const topicBlueprints = [...topicSetA, ...topicSetB, ...topicSetC];
