import { Text, View } from "react-native";

interface CourseProgressBadgeProps {
  progressPercent: number;
}

export function CourseProgressBadge({
  progressPercent,
}: CourseProgressBadgeProps) {
  if (progressPercent >= 100) {
    return (
      <View className="mt-1.5 self-start rounded-md bg-[#dcfce7] px-2 py-1">
        <Text className="text-xs font-bold text-[#15803d]">Completed ✓</Text>
      </View>
    );
  }

  if (progressPercent > 0) {
    return (
      <View className="mt-1.5 self-start rounded-md bg-[#dbeafe] px-2 py-1">
        <Text className="text-xs font-bold text-[#1d4ed8]">
          Continue Learning · {progressPercent}%
        </Text>
      </View>
    );
  }

  return null;
}
