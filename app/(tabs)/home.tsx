import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { LegendList } from "@legendapp/list";
import { useResponsiveLayout } from "../../src/hooks/useResponsiveLayout";
import { router } from "expo-router";

import { publicApi } from "../../src/api/publicApi";
import { CourseListCard } from "../../src/components/CourseListCard";
import { CourseImage } from "../../src/components/common/CourseImage";
import { EmptyState } from "../../src/components/common/EmptyState";
import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { LEGEND_LIST_PERF } from "../../src/constants/flatListConfig";
import { COURSE_CATEGORIES } from "../../src/constants/courseCategories";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";
import { useTheme } from "../../src/hooks/useTheme";
import { courseCache } from "../../src/services/courseCache";
import { useAuthStore } from "../../src/store/authStore";
import {
  useBookmarkedCourseIds,
  useBookmarkStore,
} from "../../src/store/bookmarkStore";
import { useEnrollmentStore } from "../../src/store/enrollmentStore";
import { usePreferencesStore } from "../../src/store/preferencesStore";
import { useProgressStore } from "../../src/store/progressStore";
import { useToastStore } from "../../src/store/toastStore";
import type { CourseListItem } from "../../src/types/courseTypes";
import {
  filterCoursesByCategory,
  filterCoursesByQuery,
} from "../../src/utils/filterCourses";
import { mapCoursesWithInstructors } from "../../src/utils/mapCourses";
import { shadows } from "../../src/styles/ui";
import { cn } from "../../src/utils/cn";

const COURSE_LIMIT = 10;
const HEADER_COLLAPSE_SCROLL = 64;
const COLLAPSIBLE_HEADER_HEIGHT = 72;

const keyExtractor = (item: CourseListItem) => String(item.id);

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { isOffline } = useNetworkStatus();
  const { colors } = useTheme();
  const { listNumColumns, contentPadding, maxContentWidth, isLandscape } =
    useResponsiveLayout();
  const showToast = useToastStore((state) => state.showToast);

  const hydrateBookmarks = useBookmarkStore((state) => state.hydrate);
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const bookmarkedIds = useBookmarkedCourseIds();

  const hydrateEnrollments = useEnrollmentStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);
  const getEnrollmentByCourseId = useEnrollmentStore(
    (state) => state.getEnrollmentByCourseId
  );
  const selectedCategory = usePreferencesStore(
    (state) => state.preferences.homeCategory
  );
  const setHomeCategory = usePreferencesStore((state) => state.setHomeCategory);
  const hydratePreferences = usePreferencesStore((state) => state.hydrate);

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const collapsibleHeaderHeight = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_SCROLL],
    outputRange: [COLLAPSIBLE_HEADER_HEIGHT, 0],
    extrapolate: "clamp",
  });

  const collapsibleHeaderOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_COLLAPSE_SCROLL * 0.65],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const handleListScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const categoryFilteredCourses = useMemo(
    () => filterCoursesByCategory(courses, selectedCategory),
    [courses, selectedCategory]
  );

  const filteredCourses = useMemo(
    () => filterCoursesByQuery(categoryFilteredCourses, searchQuery),
    [categoryFilteredCourses, searchQuery]
  );

  const featuredCourse = useMemo(() => {
    if (filteredCourses.length === 0) {
      return null;
    }

    return [...filteredCourses].sort((a, b) => b.rating - a.rating)[0];
  }, [filteredCourses]);

  const listCourses = useMemo(() => {
    if (!featuredCourse) {
      return filteredCourses;
    }

    return filteredCourses.filter((course) => course.id !== featuredCourse.id);
  }, [filteredCourses, featuredCourse]);

  const loadFromCache = useCallback(async (): Promise<boolean> => {
    const cached = await courseCache.getCourses();

    if (cached?.length) {
      setCourses(cached);
      setErrorMessage(null);
      return true;
    }

    return false;
  }, []);

  const loadCourses = useCallback(
    async (isPullRefresh = false) => {
      if (isOffline) {
        const hasCache = await loadFromCache();

        if (!hasCache && !isPullRefresh) {
          setErrorMessage(
            "You are offline and no cached courses are available."
          );
        }

        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (isPullRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const [usersResponse, productsResponse] = await Promise.all([
          publicApi.getRandomUsers(COURSE_LIMIT),
          publicApi.getRandomProducts(COURSE_LIMIT),
        ]);

        const mapped = mapCoursesWithInstructors(
          productsResponse.data.data,
          usersResponse.data.data
        );

        setCourses(mapped);
        await Promise.all([
          courseCache.setCourses(mapped),
          courseCache.setInstructors(usersResponse.data.data),
        ]);
      } catch {
        const hasCache = await loadFromCache();

        if (hasCache) {
          setErrorMessage(null);
        } else {
          setErrorMessage(
            "Could not load courses. Pull to refresh and try again."
          );
          setCourses([]);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isOffline, loadFromCache]
  );

  const handleRefresh = useCallback(async () => {
    if (isOffline) {
      return;
    }

    setIsRefreshing(true);

    await Promise.all([
      hydrateBookmarks(),
      hydrateProgress().then(() => hydrateEnrollments()),
      loadCourses(true),
    ]);
  }, [
    hydrateBookmarks,
    hydrateEnrollments,
    hydrateProgress,
    isOffline,
    loadCourses,
  ]);

  const handleToggleBookmark = useCallback(
    async (course: CourseListItem) => {
      const wasBookmarked = bookmarkedIds.has(course.id);
      await toggleBookmark(course);
      showToast(
        wasBookmarked ? "Bookmark removed" : "Bookmark added",
        "success"
      );
    },
    [bookmarkedIds, showToast, toggleBookmark]
  );

  const getCourseProgress = useCallback(
    (courseId: number): number | undefined => {
      const enrollment = getEnrollmentByCourseId(courseId);
      return enrollment?.progressPercent;
    },
    [getEnrollmentByCourseId]
  );

  const handleNavigateToCourse = useCallback((courseId: number) => {
    router.push(`/(course)/${courseId}`);
  }, []);

  const renderCourse = useCallback(
    ({ item }: { item: CourseListItem }) => (
      <View
        style={
          listNumColumns > 1 ? { flexGrow: 1, flexShrink: 1 } : undefined
        }
      >
        <CourseListCard
          course={item}
          isBookmarked={bookmarkedIds.has(item.id)}
          onToggleBookmark={handleToggleBookmark}
          progressPercent={getCourseProgress(item.id)}
        />
      </View>
    ),
    [bookmarkedIds, getCourseProgress, handleToggleBookmark, listNumColumns]
  );

  const listEmptyComponent = useMemo(
    () =>
      searchQuery.trim() || selectedCategory !== "all" ? (
        <EmptyState
          title="No courses found"
          subtitle="Try a different search term or category."
        />
      ) : null,
    [searchQuery, selectedCategory]
  );

  const listHeaderComponent = useMemo(() => {
    if (!featuredCourse) {
      return null;
    }

    return (
      <Pressable
        className={cn(
          "mb-4 overflow-hidden rounded-card border",
          isLandscape && "flex-row"
        )}
        style={[
          shadows.featuredCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => handleNavigateToCourse(featuredCourse.id)}
      >
        <CourseImage
          uri={featuredCourse.thumbnail}
          category={featuredCourse.category}
          containerStyle={
            isLandscape
              ? { width: "42%", height: 140 }
              : { width: "100%", height: 160 }
          }
          style={{ width: "100%", height: isLandscape ? 140 : 160 }}
          borderRadius={12}
        />
        <View className="gap-1 p-[14px]">
          <Text
            className="text-xs font-bold uppercase tracking-[0.5px]"
            style={{ color: colors.primary }}
          >
            Featured course
          </Text>
          <Text
            className="text-lg font-bold"
            numberOfLines={2}
            style={{ color: colors.text }}
          >
            {featuredCourse.title}
          </Text>
          <Text
            className="text-sm font-medium"
            style={{ color: colors.mutedText }}
          >
            {featuredCourse.instructorName} · ★{" "}
            {featuredCourse.rating.toFixed(1)}
          </Text>
        </View>
      </Pressable>
    );
  }, [featuredCourse, handleNavigateToCourse, isLandscape, colors]);

  useEffect(() => {
    void hydratePreferences();
    void hydrateBookmarks();
    void hydrateProgress().then(() => hydrateEnrollments());
    void loadCourses();
  }, [
    hydrateBookmarks,
    hydrateEnrollments,
    hydratePreferences,
    hydrateProgress,
    loadCourses,
  ]);

  if (isLoading) {
    return (
      <View
        className="flex-1 pt-4"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="mb-1 text-2xl font-bold"
          style={{ color: colors.text }}
        >
          Welcome{user?.username ? `, ${user.username}` : ""}!
        </Text>
        <View className="flex-1">
          <LoadingState message="Loading courses..." />
        </View>
      </View>
    );
  }

  if (errorMessage && courses.length === 0) {
    return (
      <View
        className="flex-1 pt-4"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="mb-1 text-2xl font-bold"
          style={{ color: colors.text }}
        >
          Welcome{user?.username ? `, ${user.username}` : ""}!
        </Text>
        <View className="flex-1">
          <ErrorState
            message={errorMessage}
            onRetry={() => void loadCourses(false)}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 pt-4"
      style={{
        backgroundColor: colors.background,
        paddingHorizontal: contentPadding,
        maxWidth: maxContentWidth,
        alignSelf: maxContentWidth ? "center" : undefined,
        width: maxContentWidth ? "100%" : undefined,
      }}
    >
      <Animated.View
        className="overflow-hidden"
        style={{
          maxHeight: collapsibleHeaderHeight,
          opacity: collapsibleHeaderOpacity,
        }}
      >
        <View
          className="justify-center pb-4"
          style={{ minHeight: COLLAPSIBLE_HEADER_HEIGHT }}
        >
          <Text
            className="mb-1 text-2xl font-bold"
            style={{ color: colors.text }}
          >
            Welcome{user?.username ? `, ${user.username}` : ""}!
          </Text>
          <Text
            className="text-[17px] font-semibold"
            style={{ color: colors.mutedText }}
          >
            Discover courses
          </Text>
        </View>
      </Animated.View>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search courses by title..."
        placeholderTextColor={colors.placeholder}
        className="mb-[14px] rounded-xl border px-[14px] py-3 text-[15px]"
        style={{
          backgroundColor: colors.input,
          borderColor: colors.border,
          color: colors.text,
        }}
        selectionColor={colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4 shrink-0 grow-0"
        contentContainerStyle={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        {COURSE_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;

          return (
            <Pressable
              key={category.id}
              className="shrink self-center rounded-chip border px-[14px] py-2"
              style={{
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.primary : colors.card,
              }}
              onPress={() => void setHomeCategory(category.id)}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{
                  color: isSelected ? colors.onPrimary : colors.secondaryText,
                }}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <LegendList
        key={listNumColumns}
        className="flex-1"
        data={listCourses}
        extraData={bookmarks}
        keyExtractor={keyExtractor}
        renderItem={renderCourse}
        numColumns={listNumColumns}
        columnWrapperStyle={listNumColumns > 1 ? { gap: 12 } : undefined}
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleListScroll}
        scrollEventThrottle={16}
        refreshing={isRefreshing}
        onRefresh={isOffline ? undefined : () => void handleRefresh()}
        {...LEGEND_LIST_PERF}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}
