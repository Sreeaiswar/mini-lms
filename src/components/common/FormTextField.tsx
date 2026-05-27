import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Platform,
  Text,
  TextInput,
  View,
  Pressable,
  type TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { useTheme } from "../../hooks/useTheme";

const INPUT_HEIGHT = 48;

const inputAlignStyle =
  Platform.OS === "android"
    ? { textAlignVertical: "center" as const, includeFontPadding: false }
    : { paddingTop: 0, paddingBottom: 0, lineHeight: 20 };

interface FormTextFieldProps<T extends FieldValues> extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "onBlur"
> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  containerClassName?: string;
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  containerClassName,
  editable = true,
  secureTextEntry,
  placeholderTextColor,
  style,
  ...inputProps
}: FormTextFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = secureTextEntry;
  const { colors } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className={containerClassName}>
          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.secondaryText }}
          >
            {label}
          </Text>
          <View className="relative">
            <TextInput
              {...inputProps}
              className="mb-1 rounded-control border px-[14px] text-left text-base"
              style={[
                {
                  height: INPUT_HEIGHT,
                  backgroundColor: colors.input,
                  borderColor: error ? colors.error : colors.borderStrong,
                  color: colors.text,
                },
                isPasswordField ? { paddingRight: 48 } : null,
                inputAlignStyle,
                style,
              ]}
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={editable}
              secureTextEntry={isPasswordField && !showPassword}
              placeholderTextColor={
                placeholderTextColor ?? colors.placeholder
              }
              selectionColor={colors.primary}
            />
            {isPasswordField && (
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-[48px] w-[48px] items-center justify-center"
                disabled={!editable}
              >
                {showPassword ? (
                  <Eye size={20} color={colors.mutedText} />
                ) : (
                  <EyeOff size={20} color={colors.mutedText} />
                )}
              </Pressable>
            )}
          </View>
          {error?.message ? (
            <Text
              className="mb-3 text-sm"
              style={{ color: colors.error }}
            >
              {error.message}
            </Text>
          ) : (
            <View className="mb-3" />
          )}
        </View>
      )}
    />
  );
}
