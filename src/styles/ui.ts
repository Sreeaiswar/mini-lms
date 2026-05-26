import type { ViewStyle } from "react-native";

/** Original StyleSheet shadows — RN does not map 1:1 from Tailwind shadow utilities. */
export const shadows = {
  courseCard: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featuredCard: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  learningCard: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statCard: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
} satisfies Record<string, ViewStyle>;

export const colors = {
  canvas: "#f8fafc",
  text: "#0f172a",
  textMuted: "#64748b",
  textLabel: "#334155",
  textBody: "#475569",
  border: "#e2e8f0",
  borderInput: "#cbd5e1",
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  white: "#ffffff",
} as const;
