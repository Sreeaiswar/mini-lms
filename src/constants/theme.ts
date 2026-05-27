export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  secondaryBackground: string;
  card: string;
  input: string;
  border: string;
  borderStrong: string;
  text: string;
  secondaryText: string;
  mutedText: string;
  placeholder: string;
  primary: string;
  primaryDark: string;
  onPrimary: string;
  success: string;
  successText: string;
  successBg: string;
  warning: string;
  warningText: string;
  warningBg: string;
  error: string;
  errorText: string;
  errorBg: string;
  info: string;
  infoText: string;
  infoBg: string;
  tabBar: string;
  tabBarInactive: string;
  tabBarBorder: string;
  header: string;
  headerText: string;
  shadow: string;
  progressTrack: string;
  overlay: string;
  bookmarkActive: string;
  bookmarkInactive: string;
}

export const lightTheme: ThemeColors = {
  background: "#f8fafc",
  secondaryBackground: "#f1f5f9",
  card: "#ffffff",
  input: "#ffffff",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  text: "#0f172a",
  secondaryText: "#475569",
  mutedText: "#64748b",
  placeholder: "#94a3b8",
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  onPrimary: "#ffffff",
  success: "#16a34a",
  successText: "#15803d",
  successBg: "#dcfce7",
  warning: "#ca8a04",
  warningText: "#854d0e",
  warningBg: "#fef9c3",
  error: "#dc2626",
  errorText: "#b91c1c",
  errorBg: "#fef2f2",
  info: "#2563eb",
  infoText: "#1d4ed8",
  infoBg: "#eff6ff",
  tabBar: "#ffffff",
  tabBarInactive: "#94a3b8",
  tabBarBorder: "#e2e8f0",
  header: "#ffffff",
  headerText: "#0f172a",
  shadow: "#0f172a",
  progressTrack: "#e2e8f0",
  overlay: "rgba(15, 23, 42, 0.4)",
  bookmarkActive: "#ca8a04",
  bookmarkInactive: "#94a3b8",
};

export const darkTheme: ThemeColors = {
  background: "#0F172A",
  secondaryBackground: "#111827",
  card: "#1E293B",
  input: "#1E293B",
  border: "#334155",
  borderStrong: "#475569",
  text: "#F8FAFC",
  secondaryText: "#CBD5E1",
  mutedText: "#94A3B8",
  placeholder: "#64748B",
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  onPrimary: "#FFFFFF",
  success: "#22C55E",
  successText: "#86EFAC",
  successBg: "#052E16",
  warning: "#FACC15",
  warningText: "#FDE68A",
  warningBg: "#422006",
  error: "#F87171",
  errorText: "#FCA5A5",
  errorBg: "#450A0A",
  info: "#60A5FA",
  infoText: "#BFDBFE",
  infoBg: "#0C223F",
  tabBar: "#0B1220",
  tabBarInactive: "#64748B",
  tabBarBorder: "#1E293B",
  header: "#0B1220",
  headerText: "#F8FAFC",
  shadow: "#000000",
  progressTrack: "#334155",
  overlay: "rgba(0, 0, 0, 0.55)",
  bookmarkActive: "#FACC15",
  bookmarkInactive: "#64748B",
};

export const theme = {
  light: lightTheme,
  dark: darkTheme,
} as const;
