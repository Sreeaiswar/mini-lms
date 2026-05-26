import { Pressable, Text, View } from "react-native";

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
  return (
    <View
      className="flex-1 items-center justify-center bg-canvas px-6"
      style={{ gap: 12 }}
    >
      <Text className="text-center text-lg font-bold text-ink">{title}</Text>
      <Text className="text-center text-[15px] leading-[22px] text-muted">
        {message}
      </Text>
      <Pressable
        className="mt-1 rounded-lg bg-brand px-5 py-2.5"
        onPress={onRetry}
      >
        <Text className="text-[15px] font-semibold text-white">Retry</Text>
      </Pressable>
    </View>
  );
}
