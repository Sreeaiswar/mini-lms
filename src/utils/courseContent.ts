export interface CourseLesson {
  id: string;
  title: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

const MODULE_TITLES = [
  "Getting Started",
  "Core Concepts",
  "Advanced Topics",
] as const;

const LESSON_TITLES = [
  "Introduction",
  "Hands-on Practice",
  "Review & Quiz",
] as const;

export function getCourseContent(courseId: number): CourseModule[] {
  return MODULE_TITLES.map((moduleTitle, moduleIndex) => ({
    id: `${courseId}-module-${moduleIndex + 1}`,
    title: `Module ${moduleIndex + 1}: ${moduleTitle}`,
    lessons: LESSON_TITLES.map((lessonTitle, lessonIndex) => ({
      id: `${courseId}-module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
      title: `Lesson ${lessonIndex + 1}: ${lessonTitle}`,
    })),
  }));
}

export function getTotalLessonCount(modules: CourseModule[]): number {
  return modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export function computeProgressPercent(
  completedLessonIds: string[],
  modules: CourseModule[]
): number {
  const totalLessons = getTotalLessonCount(modules);

  if (totalLessons === 0) {
    return 0;
  }

  const completedCount = completedLessonIds.filter((lessonId) =>
    modules.some((module) =>
      module.lessons.some((lesson) => lesson.id === lessonId)
    )
  ).length;

  return Math.round((completedCount / totalLessons) * 100);
}
