import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

import { FormTextField } from "../../src/components/common/FormTextField";
import { useTheme } from "../../src/hooks/useTheme";
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
  const { colors } = useTheme();

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View>
              <View className="mb-6 items-center">
                <Image
                  source={require("../../assets/Logo.png")}
                  style={{ width: 140, height: 140 }}
                  contentFit="contain"
                  accessibilityLabel="Mini LMS logo"
                />
              </View>

              <Text
                className="mb-2 text-[28px] font-bold"
                style={{ color: colors.text }}
              >
                Create account
              </Text>
              <Text
                className="mb-8 text-[15px]"
                style={{ color: colors.mutedText }}
              >
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
                returnKeyType="next"
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
                returnKeyType="next"
              />

              <FormTextField
                control={control}
                name="password"
                label="Password"
                placeholder="Create a password"
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
                returnKeyType="next"
              />

              <FormTextField
                control={control}
                name="confirmPassword"
                label="Confirm password"
                placeholder="Re-enter your password"
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={() => void onSubmit()}
              />

              {errors.root?.message ? (
                <Text
                  className="mb-3 text-sm"
                  style={{ color: colors.error }}
                >
                  {errors.root.message}
                </Text>
              ) : null}

              <Pressable
                className={cn(
                  "mt-2 items-center rounded-control py-[14px]",
                  isLoading && "opacity-70"
                )}
                style={{ backgroundColor: colors.primary }}
                onPress={() => void onSubmit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.onPrimary }}
                  >
                    Register
                  </Text>
                )}
              </Pressable>

              <Pressable
                className="mt-5 items-center"
                onPress={() => router.replace("/(auth)/login")}
                disabled={isLoading}
              >
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: colors.primary }}
                >
                  Already have an account? Login
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
