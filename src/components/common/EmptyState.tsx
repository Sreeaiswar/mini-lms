import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { BookOpen } from "lucide-react-native";

import { useTheme } from "../../hooks/useTheme";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

export function EmptyState({ title, subtitle, icon }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-8 py-10"
      style={{ gap: 10 }}
    >
      <View
        className="mb-2 h-[72px] w-[72px] items-center justify-center rounded-full"
        style={{ backgroundColor: colors.secondaryBackground }}
      >
        {icon ?? <BookOpen size={36} color={colors.placeholder} />}
      </View>
      <Text
        className="text-center text-lg font-bold"
        style={{ color: colors.secondaryText }}
      >
        {title}
      </Text>
      <Text
        className="text-center text-[15px] leading-[22px]"
        style={{ color: colors.mutedText }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
