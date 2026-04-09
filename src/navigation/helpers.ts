import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useRootNavigation() {
  return useNavigation<RootNavigationProp>();
}
