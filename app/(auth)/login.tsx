import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

import { FormTextField } from "../../src/components/common/FormTextField";
import { useAuthStore } from "../../src/store/authStore";
import { useToastStore } from "../../src/store/toastStore";
import {
  loginSchema,
  type LoginFormValues,
} from "../../src/validation/authSchemas";
import { cn } from "../../src/utils/cn";
import { getErrorMessage } from "../../src/utils/getErrorMessage";

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      showToast("Login successful", "success");
    } catch (err) {
      setError("root", {
        type: "server",
        message: getErrorMessage(
          err,
          "Login failed. Please check your credentials."
        ),
      });
    }
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={Platform.OS === "android"}
        >
          <View className="px-6">
            <View className="mb-6 items-center">
              <Image
                source={require("../../assets/Logo.png")}
                style={{ width: 140, height: 140 }}
                contentFit="contain"
                accessibilityLabel="Mini LMS logo"
              />
            </View>

            <Text className="mb-2 text-[28px] font-bold text-ink">Welcome back</Text>
            <Text className="mb-8 text-[15px] text-muted">
              Sign in to continue learning
            </Text>

            <FormTextField
              control={control}
              name="username"
              label="Username"
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            <FormTextField
              control={control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />

            {errors.root?.message ? (
              <Text className="mb-3 text-sm text-red-500">{errors.root.message}</Text>
            ) : null}

            <Pressable
              className={cn(
                "mt-2 items-center rounded-control bg-brand py-[14px]",
                isLoading && "opacity-70"
              )}
              onPress={() => void onSubmit()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">Login</Text>
              )}
            </Pressable>

            <Pressable
              className="mt-5 items-center"
              onPress={() => router.push("/(auth)/register")}
              disabled={isLoading}
            >
              <Text className="text-[15px] font-semibold text-brand">
                Don&apos;t have an account? Register
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
