import { create } from "zustand";

import {
  COURSE_PROGRESS_STORAGE_KEY,
  LESSON_PROGRESS_STORAGE_KEY,
} from "../constants/storageKeys";
import { storage } from "../services/storage";
import {
  computeProgressPercent,
  getCourseContent,
} from "../utils/courseContent";

type ProgressMap = Record<string, number>;
type CompletedLessonsMap = Record<string, string[]>;

interface ProgressState {
  progressByCourseId: ProgressMap;
  completedLessonsByCourseId: CompletedLessonsMap;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  getProgress: (courseId: number) => number;
  isLessonComplete: (courseId: number, lessonId: string) => boolean;
  markLessonComplete: (courseId: number, lessonId: string) => Promise<number>;
  initCourseProgress: (courseId: number) => Promise<void>;
  clearProgress: () => Promise<void>;
}

function parseProgressMap(stored: unknown): ProgressMap {
  if (!stored || typeof stored !== "object") {
    return {};
  }

  const map: ProgressMap = {};

  for (const [key, value] of Object.entries(stored)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      map[key] = Math.min(100, Math.max(0, Math.round(value)));
    }
  }

  return map;
}

function parseCompletedLessonsMap(stored: unknown): CompletedLessonsMap {
  if (!stored || typeof stored !== "object") {
    return {};
  }

  const map: CompletedLessonsMap = {};

  for (const [key, value] of Object.entries(stored)) {
    if (Array.isArray(value)) {
      map[key] = value.filter((item): item is string => typeof item === "string");
    }
  }

  return map;
}

async function persistProgress(
  progressByCourseId: ProgressMap,
  completedLessonsByCourseId: CompletedLessonsMap
): Promise<void> {
  await Promise.all([
    storage.set(COURSE_PROGRESS_STORAGE_KEY, progressByCourseId),
    storage.set(LESSON_PROGRESS_STORAGE_KEY, completedLessonsByCourseId),
  ]);
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressByCourseId: {},
  completedLessonsByCourseId: {},
  isHydrated: false,

  hydrate: async () => {
    const [storedProgress, storedLessons] = await Promise.all([
      storage.get(COURSE_PROGRESS_STORAGE_KEY),
      storage.get(LESSON_PROGRESS_STORAGE_KEY),
    ]);

    set({
      progressByCourseId: parseProgressMap(storedProgress),
      completedLessonsByCourseId: parseCompletedLessonsMap(storedLessons),
      isHydrated: true,
    });
  },

  getProgress: (courseId) => {
    const key = String(courseId);
    return get().progressByCourseId[key] ?? 0;
  },

  isLessonComplete: (courseId, lessonId) => {
    const key = String(courseId);
    const completed = get().completedLessonsByCourseId[key] ?? [];
    return completed.includes(lessonId);
  },

  initCourseProgress: async (courseId) => {
    const key = String(courseId);

    if (get().progressByCourseId[key] != null) {
      return;
    }

    const progressByCourseId = { ...get().progressByCourseId, [key]: 0 };
    const completedLessonsByCourseId = {
      ...get().completedLessonsByCourseId,
      [key]: [],
    };

    await persistProgress(progressByCourseId, completedLessonsByCourseId);
    set({ progressByCourseId, completedLessonsByCourseId });
  },

  markLessonComplete: async (courseId, lessonId) => {
    const key = String(courseId);
    const modules = getCourseContent(courseId);
    const existing = get().completedLessonsByCourseId[key] ?? [];

    if (existing.includes(lessonId)) {
      return get().progressByCourseId[key] ?? 0;
    }

    const completedLessonIds = [...existing, lessonId];
    const progressPercent = computeProgressPercent(completedLessonIds, modules);

    const progressByCourseId = {
      ...get().progressByCourseId,
      [key]: progressPercent,
    };
    const completedLessonsByCourseId = {
      ...get().completedLessonsByCourseId,
      [key]: completedLessonIds,
    };

    await persistProgress(progressByCourseId, completedLessonsByCourseId);
    set({ progressByCourseId, completedLessonsByCourseId });

    return progressPercent;
  },

  clearProgress: async () => {
    await Promise.all([
      storage.remove(COURSE_PROGRESS_STORAGE_KEY),
      storage.remove(LESSON_PROGRESS_STORAGE_KEY),
    ]);

    set({
      progressByCourseId: {},
      completedLessonsByCourseId: {},
      isHydrated: true,
    });
  },
}));
