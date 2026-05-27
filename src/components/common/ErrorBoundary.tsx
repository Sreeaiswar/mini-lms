import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";

import { darkTheme, lightTheme } from "../../constants/theme";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string | null;
}

function FallbackUI({
  title,
  message,
  onReset,
}: {
  title: string;
  message: string;
  onReset: () => void;
}) {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? darkTheme : lightTheme;

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: colors.background }}
    >
      <Text
        className="mb-2 text-center text-xl font-bold"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      <Text
        className="mb-6 text-center text-[15px]"
        style={{ color: colors.mutedText }}
      >
        {message}
      </Text>
      <Pressable
        className="min-w-[160px] items-center rounded-control px-6 py-3"
        style={{ backgroundColor: colors.primary }}
        onPress={onReset}
      >
        <Text
          className="text-[15px] font-semibold"
          style={{ color: colors.onPrimary }}
        >
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "Something went wrong.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, message: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <FallbackUI
        title={this.props.fallbackTitle ?? "Unexpected error"}
        message={
          this.state.message ??
          "The app ran into a problem. You can try again."
        }
        onReset={this.handleReset}
      />
    );
  }
}
