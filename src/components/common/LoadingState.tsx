import { ActivityIndicator, Text, View } from "react-native";

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center bg-canvas px-6"
      style={{ gap: 12 }}
    >
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="text-center text-[15px] font-semibold text-muted">
        {message}
      </Text>
    </View>
  );
}
