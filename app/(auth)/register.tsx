import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
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
  registerSchema,
  type RegisterFormValues,
} from "../../src/validation/authSchemas";
import { cn } from "../../src/utils/cn";
import { getErrorMessage } from "../../src/utils/getErrorMessage";

export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
        role: "USER",
      });

      showToast("Registration successful. Please sign in.", "success");
      router.replace("/(auth)/login");
    } catch (err) {
      setError("root", {
        type: "server",
        message: getErrorMessage(err, "Registration failed. Please try again."),
      });
    }
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center bg-canvas px-6"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 items-center">
          <Image
            source={require("../../assets/Logo.png")}
            style={{ width: 140, height: 140 }}
            contentFit="contain"
            accessibilityLabel="Mini LMS logo"
          />
        </View>

        <Text className="mb-2 text-[28px] font-bold text-ink">Create account</Text>
        <Text className="mb-8 text-[15px] text-muted">
          Join Mini LMS to start learning
        </Text>

        <FormTextField
          control={control}
          name="username"
          label="Username"
          placeholder="Choose a username"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        <FormTextField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        <FormTextField
          control={control}
          name="password"
          label="Password"
          placeholder="Create a password"
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        <FormTextField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
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
            <Text className="text-base font-semibold text-white">Register</Text>
          )}
        </Pressable>

        <Pressable
          className="mt-5 items-center"
          onPress={() => router.replace("/(auth)/login")}
          disabled={isLoading}
        >
          <Text className="text-[15px] font-semibold text-brand">
            Already have an account? Login
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
