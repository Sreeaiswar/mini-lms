import { Pressable } from "react-native";
import { Star } from "lucide-react-native";

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
  const iconColor = isBookmarked ? "#ca8a04" : "#94a3b8";

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
