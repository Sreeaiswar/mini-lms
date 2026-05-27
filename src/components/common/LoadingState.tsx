import { ActivityIndicator, Text, View } from "react-native";

import { useTheme } from "../../hooks/useTheme";

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ gap: 12, backgroundColor: colors.background }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text
        className="text-center text-[15px] font-semibold"
        style={{ color: colors.mutedText }}
      >
        {message}
      </Text>
    </View>
  );
}
