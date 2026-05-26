import type { CourseCategoryId } from "../constants/courseCategories";
import type { CourseListItem } from "../types/courseTypes";

export function filterCoursesByCategory(
  courses: CourseListItem[],
  categoryId: CourseCategoryId
): CourseListItem[] {
  if (categoryId === "all") {
    return courses;
  }

  return courses.filter(
    (course) => course.category.toLowerCase() === categoryId.toLowerCase()
  );
}

export function filterCoursesByQuery(
  courses: CourseListItem[],
  query: string
): CourseListItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return courses;
  }

  return courses.filter((course) =>
    course.title.toLowerCase().includes(normalizedQuery)
  );
}
