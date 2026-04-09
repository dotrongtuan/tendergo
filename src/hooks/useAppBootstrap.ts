import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { SourceSerif4_700Bold } from '@expo-google-fonts/source-serif-4';
import { useFonts } from 'expo-font';

import { useAppStore } from '../store/useAppStore';

export function useAppBootstrap() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    SourceSerif4_700Bold,
  });

  return {
    isReady: hasHydrated && fontsLoaded,
    error: fontError,
  };
}
