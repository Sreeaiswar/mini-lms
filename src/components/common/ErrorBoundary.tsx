import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string | null;
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
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text className="mb-2 text-center text-xl font-bold text-ink">
          {this.props.fallbackTitle ?? "Unexpected error"}
        </Text>
        <Text className="mb-6 text-center text-[15px] text-muted">
          {this.state.message ??
            "The app ran into a problem. You can try again."}
        </Text>
        <Pressable
          className="min-w-[160px] items-center rounded-control bg-brand px-6 py-3"
          onPress={this.handleReset}
        >
          <Text className="text-[15px] font-semibold text-white">Try again</Text>
        </Pressable>
      </View>
    );
  }
}
