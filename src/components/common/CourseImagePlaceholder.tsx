import { Text, View, type ViewStyle } from "react-native";
import { BookOpen } from "lucide-react-native";

interface CourseImagePlaceholderProps {
  borderRadius?: number;
  style?: ViewStyle;
}

export function CourseImagePlaceholder({
  borderRadius = 10,
  style,
}: CourseImagePlaceholderProps) {
  return (
    <View
      className="h-full w-full flex-1 items-center justify-center gap-1.5 bg-line"
      style={[{ borderRadius }, style]}
    >
      <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-[#f1f5f9]">
        <BookOpen size={28} color="#64748b" strokeWidth={1.75} />
      </View>
      <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        Course
      </Text>
    </View>
  );
}
