import {
  COURSES_CACHE_KEY,
  INSTRUCTORS_CACHE_KEY,
} from "../constants/storageKeys";
import { storage } from "./storage";
import type { CourseListItem, RandomUser } from "../types/courseTypes";

export interface CoursesCachePayload {
  courses: CourseListItem[];
  cachedAt: string;
}

export interface InstructorsCachePayload {
  instructors: RandomUser[];
  cachedAt: string;
}

export const courseCache = {
  async getCourses(): Promise<CourseListItem[] | null> {
    const payload = (await storage.get(
      COURSES_CACHE_KEY
    )) as CoursesCachePayload | null;

    if (!payload?.courses?.length) {
      return null;
    }

    return payload.courses;
  },

  async setCourses(courses: CourseListItem[]): Promise<void> {
    const payload: CoursesCachePayload = {
      courses,
      cachedAt: new Date().toISOString(),
    };

    await storage.set(COURSES_CACHE_KEY, payload);
  },

  async getInstructors(): Promise<RandomUser[] | null> {
    const payload = (await storage.get(
      INSTRUCTORS_CACHE_KEY
    )) as InstructorsCachePayload | null;

    if (!payload?.instructors?.length) {
      return null;
    }

    return payload.instructors;
  },

  async setInstructors(instructors: RandomUser[]): Promise<void> {
    const payload: InstructorsCachePayload = {
      instructors,
      cachedAt: new Date().toISOString(),
    };

    await storage.set(INSTRUCTORS_CACHE_KEY, payload);
  },
};
