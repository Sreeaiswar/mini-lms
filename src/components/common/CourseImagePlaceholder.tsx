import { Text, View, type ViewStyle } from "react-native";
import { BookOpen } from "lucide-react-native";

import { useTheme } from "../../hooks/useTheme";

interface CourseImagePlaceholderProps {
  borderRadius?: number;
  style?: ViewStyle;
}

export function CourseImagePlaceholder({
  borderRadius = 10,
  style,
}: CourseImagePlaceholderProps) {
  const { colors } = useTheme();

  return (
    <View
      className="h-full w-full flex-1 items-center justify-center gap-1.5"
      style={[
        { borderRadius, backgroundColor: colors.border },
        style,
      ]}
    >
      <View
        className="h-[52px] w-[52px] items-center justify-center rounded-full"
        style={{ backgroundColor: colors.secondaryBackground }}
      >
        <BookOpen size={28} color={colors.mutedText} strokeWidth={1.75} />
      </View>
      <Text
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: colors.mutedText }}
      >
        Course
      </Text>
    </View>
  );
}
