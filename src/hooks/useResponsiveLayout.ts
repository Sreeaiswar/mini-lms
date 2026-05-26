import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isLandscape = width > height;
    const isWide = width >= 768;
    const listNumColumns = isLandscape && width >= 600 ? 2 : 1;
    const contentPadding = isLandscape ? 24 : 20;
    const maxContentWidth = isWide ? 920 : undefined;
    const heroImageHeight = isLandscape ? 180 : 220;

    return {
      width,
      height,
      isLandscape,
      isWide,
      listNumColumns,
      contentPadding,
      maxContentWidth,
      heroImageHeight,
    };
  }, [width, height]);
}
