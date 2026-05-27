export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  secondaryBackground: string;
  card: string;
  cardElevated: string;
  input: string;
  border: string;
  borderStrong: string;
  divider: string;
  text: string;
  secondaryText: string;
  mutedText: string;
  placeholder: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentDark: string;
  onAccent: string;
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
  shadowOpacity: number;
  progressTrack: string;
  overlay: string;
  bookmarkActive: string;
  bookmarkInactive: string;
  buttonOnDarkBg: string;
  buttonOnDarkText: string;
}

export const lightTheme: ThemeColors = {
  background: "#F8FAFC",
  secondaryBackground: "#F1F5F9",
  card: "#FFFFFF",
  cardElevated: "#FFFFFF",
  input: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  divider: "#E2E8F0",
  text: "#0F172A",
  secondaryText: "#475569",
  mutedText: "#64748B",
  placeholder: "#94A3B8",
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#DBEAFE",
  onPrimary: "#FFFFFF",
  accent: "#7C3AED",
  accentDark: "#6D28D9",
  onAccent: "#FFFFFF",
  success: "#16A34A",
  successText: "#15803D",
  successBg: "#DCFCE7",
  warning: "#CA8A04",
  warningText: "#854D0E",
  warningBg: "#FEF9C3",
  error: "#DC2626",
  errorText: "#B91C1C",
  errorBg: "#FEF2F2",
  info: "#2563EB",
  infoText: "#1D4ED8",
  infoBg: "#EFF6FF",
  tabBar: "#FFFFFF",
  tabBarInactive: "#94A3B8",
  tabBarBorder: "#E2E8F0",
  header: "#FFFFFF",
  headerText: "#0F172A",
  shadow: "#0F172A",
  shadowOpacity: 0.08,
  progressTrack: "#E2E8F0",
  overlay: "rgba(15, 23, 42, 0.4)",
  bookmarkActive: "#CA8A04",
  bookmarkInactive: "#94A3B8",
  buttonOnDarkBg: "#0F172A",
  buttonOnDarkText: "#FFFFFF",
};

export const darkTheme: ThemeColors = {
  // Premium navy-slate base — deeper than slate-900 for richer contrast against cards
  background: "#0A1124",
  secondaryBackground: "#111A30",
  // Card surface sits one step lighter than the background so elevation reads naturally
  card: "#162038",
  cardElevated: "#1B2742",
  input: "#162038",
  border: "#26314E",
  borderStrong: "#3A4870",
  divider: "#1F2B47",
  text: "#F1F5F9",
  secondaryText: "#CBD5E1",
  mutedText: "#94A3B8",
  placeholder: "#64748B",
  // Slightly brighter blue so the brand pops against the navy surfaces
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primarySoft: "#1D2E55",
  onPrimary: "#FFFFFF",
  accent: "#A78BFA",
  accentDark: "#8B5CF6",
  onAccent: "#0A1124",
  success: "#22C55E",
  successText: "#86EFAC",
  successBg: "#0F2E1F",
  warning: "#FACC15",
  warningText: "#FDE68A",
  warningBg: "#2E2207",
  error: "#F87171",
  errorText: "#FCA5A5",
  errorBg: "#3B1414",
  info: "#60A5FA",
  infoText: "#BFDBFE",
  infoBg: "#142A4E",
  // Tab bar / header even darker than the canvas — gives the chrome a distinct layer
  tabBar: "#070D1F",
  tabBarInactive: "#7283A4",
  tabBarBorder: "#1A2540",
  header: "#070D1F",
  headerText: "#F1F5F9",
  shadow: "#000000",
  shadowOpacity: 0.4,
  progressTrack: "#26314E",
  overlay: "rgba(0, 0, 0, 0.6)",
  bookmarkActive: "#FBBF24",
  bookmarkInactive: "#64748B",
  // For "Continue Learning"-style dark CTAs: in dark mode they become elevated cards
  buttonOnDarkBg: "#1B2742",
  buttonOnDarkText: "#F1F5F9",
};

export const theme = {
  light: lightTheme,
  dark: darkTheme,
} as const;
