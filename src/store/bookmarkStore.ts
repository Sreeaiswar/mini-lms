import { useMemo } from "react";
import { create } from "zustand";

import { BOOKMARKS_STORAGE_KEY } from "../constants/storageKeys";
import { showBookmarkMilestone } from "../services/notificationService";
import { storage } from "../services/storage";
import type { CourseListItem } from "../types/courseTypes";

interface BookmarkState {
  bookmarks: CourseListItem[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  toggleBookmark: (course: CourseListItem) => Promise<void>;
  isBookmarked: (courseId: number) => boolean;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isHydrated: false,

  hydrate: async () => {
    const stored = await storage.get(BOOKMARKS_STORAGE_KEY);
    const bookmarks = Array.isArray(stored)
      ? (stored as CourseListItem[])
      : [];

    set({ bookmarks, isHydrated: true });
  },

  toggleBookmark: async (course) => {
    const { bookmarks } = get();
    const isBookmarked = bookmarks.some((item) => item.id === course.id);
    const nextBookmarks = isBookmarked
      ? bookmarks.filter((item) => item.id !== course.id)
      : [...bookmarks, course];

    await storage.set(BOOKMARKS_STORAGE_KEY, nextBookmarks);
    set({ bookmarks: nextBookmarks });

    if (!isBookmarked && nextBookmarks.length >= 5) {
      void showBookmarkMilestone();
    }
  },

  isBookmarked: (courseId) =>
    get().bookmarks.some((item) => item.id === courseId),
}));

/** Subscribes to `bookmarks` so UI updates when toggling. */
export function useBookmarkedCourseIds(): ReadonlySet<number> {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  return useMemo(
    () => new Set(bookmarks.map((item) => item.id)),
    [bookmarks]
  );
}

export function useIsCourseBookmarked(courseId: number): boolean {
  return useBookmarkStore((state) =>
    state.bookmarks.some((item) => item.id === courseId)
  );
}
