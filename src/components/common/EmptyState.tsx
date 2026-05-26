import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { BookOpen } from "lucide-react-native";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

export function EmptyState({ title, subtitle, icon }: EmptyStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center px-8 py-10"
      style={{ gap: 10 }}
    >
      <View className="mb-2 h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f1f5f9]">
        {icon ?? <BookOpen size={36} color="#94a3b8" />}
      </View>
      <Text className="text-center text-lg font-bold text-label">{title}</Text>
      <Text className="text-center text-[15px] leading-[22px] text-muted">
        {subtitle}
      </Text>
    </View>
  );
}
