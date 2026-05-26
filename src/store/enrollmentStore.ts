import { create } from "zustand";

import { ENROLLMENTS_STORAGE_KEY } from "../constants/storageKeys";
import { storage } from "../services/storage";
import type { CourseDetail } from "../types/courseTypes";
import type { EnrolledCourse } from "../types/enrollmentTypes";
import { toCourseDetail } from "../utils/mapCourses";
import { useProgressStore } from "./progressStore";

interface EnrollmentState {
  enrollments: EnrolledCourse[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  enroll: (course: CourseDetail) => Promise<void>;
  syncCourseProgress: (courseId: number, progressPercent: number) => Promise<void>;
  clearEnrollments: () => Promise<void>;
  isEnrolled: (courseId: number) => boolean;
  getEnrollmentByCourseId: (courseId: number) => EnrolledCourse | undefined;
}

function parseEnrollments(stored: unknown): EnrolledCourse[] {
  if (!Array.isArray(stored)) {
    return [];
  }

  return stored
    .filter(
      (item): item is EnrolledCourse =>
        typeof item === "object" &&
        item != null &&
        "course" in item &&
        typeof (item as EnrolledCourse).course?.id === "number"
    )
    .map((item) => ({
      ...item,
      course: toCourseDetail(item.course),
    }));
}

function applyStoredProgress(enrollments: EnrolledCourse[]): EnrolledCourse[] {
  const { progressByCourseId } = useProgressStore.getState();

  return enrollments.map((enrollment) => {
    const storedProgress = progressByCourseId[String(enrollment.course.id)];

    if (storedProgress == null) {
      return enrollment;
    }

    const progressPercent = storedProgress;
    const completedAt =
      progressPercent >= 100
        ? (enrollment.completedAt ?? new Date().toISOString())
        : undefined;

    return {
      ...enrollment,
      progressPercent,
      completedAt,
    };
  });
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  enrollments: [],
  isHydrated: false,

  hydrate: async () => {
    const stored = await storage.get(ENROLLMENTS_STORAGE_KEY);
    const enrollments = applyStoredProgress(parseEnrollments(stored));
    set({ enrollments, isHydrated: true });
  },

  enroll: async (course) => {
    if (get().isEnrolled(course.id)) {
      return;
    }

    await useProgressStore.getState().initCourseProgress(course.id);

    const enrollment: EnrolledCourse = {
      course: toCourseDetail(course),
      progressPercent: 0,
      enrolledAt: new Date().toISOString(),
    };

    const nextEnrollments = [...get().enrollments, enrollment];
    await storage.set(ENROLLMENTS_STORAGE_KEY, nextEnrollments);
    set({ enrollments: nextEnrollments });
  },

  syncCourseProgress: async (courseId, progressPercent) => {
    const nextEnrollments = get().enrollments.map((enrollment) => {
      if (enrollment.course.id !== courseId) {
        return enrollment;
      }

      const completedAt =
        progressPercent >= 100
          ? (enrollment.completedAt ?? new Date().toISOString())
          : undefined;

      return {
        ...enrollment,
        progressPercent,
        completedAt,
      };
    });

    await storage.set(ENROLLMENTS_STORAGE_KEY, nextEnrollments);
    set({ enrollments: nextEnrollments });
  },

  clearEnrollments: async () => {
    await storage.remove(ENROLLMENTS_STORAGE_KEY);
    set({ enrollments: [], isHydrated: true });
  },

  isEnrolled: (courseId) =>
    get().enrollments.some((item) => item.course.id === courseId),

  getEnrollmentByCourseId: (courseId) =>
    get().enrollments.find((item) => item.course.id === courseId),
}));
