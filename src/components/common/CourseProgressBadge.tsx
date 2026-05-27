import { Text, View } from "react-native";

import { useTheme } from "../../hooks/useTheme";

interface CourseProgressBadgeProps {
  progressPercent: number;
}

export function CourseProgressBadge({
  progressPercent,
}: CourseProgressBadgeProps) {
  const { colors } = useTheme();

  if (progressPercent >= 100) {
    return (
      <View
        className="mt-1.5 self-start rounded-md px-2 py-1"
        style={{ backgroundColor: colors.successBg }}
      >
        <Text
          className="text-xs font-bold"
          style={{ color: colors.successText }}
        >
          Completed ✓
        </Text>
      </View>
    );
  }

  if (progressPercent > 0) {
    return (
      <View
        className="mt-1.5 self-start rounded-md px-2 py-1"
        style={{ backgroundColor: colors.infoBg }}
      >
        <Text
          className="text-xs font-bold"
          style={{ color: colors.infoText }}
        >
          Continue Learning · {progressPercent}%
        </Text>
      </View>
    );
  }

  return null;
}
