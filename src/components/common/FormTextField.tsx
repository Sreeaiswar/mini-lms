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
  type TextInputProps,
} from "react-native";

import { cn } from "../../utils/cn";

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
  className,
  editable = true,
  ...inputProps
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className={containerClassName}>
          <Text className="mb-2 text-sm font-semibold text-label">{label}</Text>
          <TextInput
            {...inputProps}
            className={cn(
              "mb-1 rounded-control border border-line-input bg-white px-[14px] text-base text-ink",
              error && "border-red-500",
              className
            )}
            style={[
              { height: INPUT_HEIGHT },
              inputAlignStyle,
              inputProps.style,
            ]}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={editable}
          />
          {error?.message ? (
            <Text className="mb-3 text-sm text-red-500">{error.message}</Text>
          ) : (
            <View className="mb-3" />
          )}
        </View>
      )}
    />
  );
}
