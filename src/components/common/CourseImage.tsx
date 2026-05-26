import { useCallback, useEffect, useMemo, useState } from "react";
import { View, type ImageStyle, type ViewStyle } from "react-native";
import { Image } from "expo-image";

import { getCategoryCourseImage } from "../../constants/courseImages";
import { resolveCourseThumbnail } from "../../utils/resolveCourseImage";
import { CourseImagePlaceholder } from "./CourseImagePlaceholder";

interface CourseImageProps {
  uri: string;
  category: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  borderRadius?: number;
}

type ImageLoadState = "resolved" | "category" | "placeholder";

export function CourseImage({
  uri,
  category,
  style,
  containerStyle,
  borderRadius = 10,
}: CourseImageProps) {
  const [loadState, setLoadState] = useState<ImageLoadState>("resolved");

  useEffect(() => {
    setLoadState("resolved");
  }, [uri, category]);

  const imageUri = useMemo(() => {
    if (loadState === "category") {
      return getCategoryCourseImage(category);
    }

    if (loadState === "placeholder") {
      return null;
    }

    return resolveCourseThumbnail(uri, category);
  }, [loadState, uri, category]);

  const handleError = useCallback(() => {
    setLoadState((current) => {
      if (current === "resolved") {
        return "category";
      }

      if (current === "category") {
        return "placeholder";
      }

      return current;
    });
  }, []);

  if (loadState === "placeholder" || !imageUri) {
    return (
      <View
        className="overflow-hidden bg-line"
        style={[{ borderRadius }, containerStyle]}
      >
        <CourseImagePlaceholder borderRadius={borderRadius} />
      </View>
    );
  }

  return (
    <View
      className="overflow-hidden bg-line"
      style={[{ borderRadius }, containerStyle]}
    >
      <Image
        key={imageUri}
        source={{ uri: imageUri }}
        className="h-full w-full"
        style={[{ borderRadius }, style]}
        contentFit="cover"
        transition={300}
        onError={handleError}
      />
    </View>
  );
}
