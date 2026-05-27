import { useColorScheme } from "react-native";

import {
  darkTheme,
  lightTheme,
  type ThemeColors,
  type ThemeMode,
} from "../constants/theme";

export interface UseThemeResult {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}

export function useTheme(): UseThemeResult {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return {
    mode: isDark ? "dark" : "light",
    isDark,
    colors: isDark ? darkTheme : lightTheme,
  };
}
