import { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import { LegendList } from "@legendapp/list";
import { Bookmark } from "lucide-react-native";

import { CourseListCard } from "../../src/components/CourseListCard";
import { EmptyState } from "../../src/components/common/EmptyState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { LEGEND_LIST_PERF } from "../../src/constants/flatListConfig";
import {
  useBookmarkedCourseIds,
  useBookmarkStore,
} from "../../src/store/bookmarkStore";
import { useToastStore } from "../../src/store/toastStore";
import type { CourseListItem } from "../../src/types/courseTypes";

const keyExtractor = (item: CourseListItem) => String(item.id);

export default function BookmarksScreen() {
  const hydrateBookmarks = useBookmarkStore((state) => state.hydrate);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const isHydrated = useBookmarkStore((state) => state.isHydrated);
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
  const bookmarkedIds = useBookmarkedCourseIds();
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    void hydrateBookmarks();
  }, [hydrateBookmarks]);

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

  const renderBookmark = useCallback(
    ({ item }: { item: CourseListItem }) => (
      <CourseListCard
        course={item}
        isBookmarked={bookmarkedIds.has(item.id)}
        onToggleBookmark={handleToggleBookmark}
      />
    ),
    [bookmarkedIds, handleToggleBookmark]
  );

  const listEmptyComponent = useCallback(
    () => (
      <EmptyState
        title="No bookmarked courses"
        subtitle="Start exploring courses and save your favorites."
        icon={<Bookmark size={36} color="#94a3b8" />}
      />
    ),
    []
  );

  if (!isHydrated) {
    return <LoadingState message="Loading bookmarks..." />;
  }

  return (
    <View className="flex-1 bg-canvas px-5 pt-4">
      <Text className="mb-1 text-2xl font-bold text-ink">Saved Courses</Text>
      <Text className="mb-5 text-sm text-muted">
        Bookmarks are stored on this device.
      </Text>

      <LegendList
        data={bookmarks}
        keyExtractor={keyExtractor}
        renderItem={renderBookmark}
        contentContainerStyle={
          bookmarks.length === 0
            ? { flexGrow: 1, paddingBottom: 32 }
            : { paddingBottom: 32 }
        }
        showsVerticalScrollIndicator={false}
        {...LEGEND_LIST_PERF}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}
