import { Pressable, Text, View } from "react-native";

import { useTheme } from "../../hooks/useTheme";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
}

export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ gap: 12, backgroundColor: colors.background }}
    >
      <Text
        className="text-center text-lg font-bold"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      <Text
        className="text-center text-[15px] leading-[22px]"
        style={{ color: colors.mutedText }}
      >
        {message}
      </Text>
      <Pressable
        className="mt-1 rounded-lg px-5 py-2.5"
        style={{ backgroundColor: colors.primary }}
        onPress={onRetry}
      >
        <Text
          className="text-[15px] font-semibold"
          style={{ color: colors.onPrimary }}
        >
          Retry
        </Text>
      </Pressable>
    </View>
  );
}
