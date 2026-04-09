import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

  return {
    width,
    isTablet: width >= 768,
    isLargeTablet: width >= 1024,
    contentMaxWidth: width >= 1280 ? 1120 : width >= 768 ? 860 : 560,
  };
}
