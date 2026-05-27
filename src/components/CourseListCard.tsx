import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { useTheme } from "../hooks/useTheme";
import type { CourseListItem } from "../types/courseTypes";
import { shadows } from "../styles/ui";
import { BookmarkIcon } from "./BookmarkIcon";
import { CourseImage } from "./common/CourseImage";
import { CourseProgressBadge } from "./common/CourseProgressBadge";

interface CourseListCardProps {
  course: CourseListItem;
  isBookmarked: boolean;
  onToggleBookmark: (course: CourseListItem) => void;
  progressPercent?: number;
}

const THUMB = { width: 112, height: 132 } as const;

function CourseListCardComponent({
  course,
  isBookmarked,
  onToggleBookmark,
  progressPercent,
}: CourseListCardProps) {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    router.push(`/(course)/${course.id}`);
  }, [course.id]);

  const handleBookmark = useCallback(() => {
    onToggleBookmark(course);
  }, [course, onToggleBookmark]);

  return (
    <View
      className="mb-[14px] flex-row items-start overflow-hidden rounded-card border"
      style={[
        shadows.courseCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <Pressable className="flex-1 flex-row" onPress={handlePress}>
        <CourseImage
          uri={course.thumbnail}
          category={course.category}
          style={THUMB}
          containerStyle={THUMB}
          borderRadius={0}
        />
        <View className="min-h-[132px] flex-1 justify-between p-3">
          <View>
            <Text
              className="text-base font-bold"
              numberOfLines={2}
              style={{ color: colors.text }}
            >
              {course.title}
            </Text>
            {progressPercent != null ? (
              <CourseProgressBadge progressPercent={progressPercent} />
            ) : null}
          </View>
          <Text
            className="text-xs font-semibold capitalize"
            style={{ color: colors.primary }}
          >
            {course.category}
          </Text>
          <Text
            className="text-xs"
            numberOfLines={2}
            style={{ color: colors.mutedText }}
          >
            {course.description}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <Image
              source={{ uri: course.instructorAvatar }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: colors.border,
              }}
              contentFit="cover"
              transition={200}
            />
            <View className="flex-1 gap-0.5">
              <Text
                className="text-[13px] font-semibold"
                numberOfLines={1}
                style={{ color: colors.secondaryText }}
              >
                {course.instructorName}
              </Text>
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.warning }}
              >
                ★ {course.rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
      <View className="pt-[10px] pr-[10px]">
        <BookmarkIcon
          isBookmarked={isBookmarked}
          onPress={handleBookmark}
        />
      </View>
    </View>
  );
}

function areCourseListCardPropsEqual(
  prev: CourseListCardProps,
  next: CourseListCardProps
): boolean {
  return (
    prev.course.id === next.course.id &&
    prev.isBookmarked === next.isBookmarked &&
    prev.progressPercent === next.progressPercent &&
    prev.onToggleBookmark === next.onToggleBookmark
  );
}

export const CourseListCard = memo(
  CourseListCardComponent,
  areCourseListCardPropsEqual
);
