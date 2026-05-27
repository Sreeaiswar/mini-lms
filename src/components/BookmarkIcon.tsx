import { Pressable } from "react-native";
import { Star } from "lucide-react-native";

import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

interface BookmarkIconProps {
  isBookmarked: boolean;
  onPress: () => void;
  size?: "small" | "large";
}

export function BookmarkIcon({
  isBookmarked,
  onPress,
  size = "small",
}: BookmarkIconProps) {
  const iconSize = size === "large" ? 28 : 20;
  const { colors } = useTheme();
  const iconColor = isBookmarked
    ? colors.bookmarkActive
    : colors.bookmarkInactive;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className={cn("p-1", size === "large" && "p-2")}
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
      accessibilityRole="button"
      accessibilityLabel={
        isBookmarked ? "Remove bookmark" : "Add bookmark"
      }
    >
      <Star
        size={iconSize}
        color={iconColor}
        fill={isBookmarked ? iconColor : "transparent"}
      />
    </Pressable>
  );
}
