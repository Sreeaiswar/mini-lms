import type {
  CourseDetail,
  CourseListItem,
  RandomProduct,
  RandomUser,
} from "../types/courseTypes";
import { resolveCourseThumbnail } from "./resolveCourseImage";

function mapInstructor(instructor: RandomUser) {
  return {
    instructorName: `${instructor.name.first} ${instructor.name.last}`,
    instructorAvatar: instructor.picture.thumbnail,
    instructorEmail: instructor.email,
  };
}

export function mapCoursesWithInstructors(
  products: RandomProduct[],
  instructors: RandomUser[]
): CourseListItem[] {
  return products.map((product, index) => {
    const instructor = instructors[index % instructors.length];
    const { instructorName, instructorAvatar } = mapInstructor(instructor);

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      thumbnail: resolveCourseThumbnail(product.thumbnail, product.category),
      rating: product.rating,
      category: product.category,
      instructorName,
      instructorAvatar,
    };
  });
}

export function mapCourseDetail(
  product: RandomProduct,
  instructor: RandomUser
): CourseDetail {
  const { instructorName, instructorAvatar, instructorEmail } =
    mapInstructor(instructor);

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    thumbnail: resolveCourseThumbnail(product.thumbnail, product.category),
    rating: product.rating,
    category: product.category,
    price: product.price,
    brand: product.brand,
    instructorName,
    instructorAvatar,
    instructorEmail,
  };
}

export function findCourseDetailById(
  courseId: number,
  products: RandomProduct[],
  instructors: RandomUser[]
): CourseDetail | null {
  const productIndex = products.findIndex((item) => item.id === courseId);

  if (productIndex === -1) {
    return null;
  }

  const product = products[productIndex];
  const instructor = instructors[productIndex % instructors.length];

  return mapCourseDetail(product, instructor);
}

export function toCourseDetail(
  course: CourseListItem & Partial<Pick<CourseDetail, "price" | "brand" | "instructorEmail">>
): CourseDetail {
  return {
    ...course,
    price: course.price ?? 0,
    brand: course.brand ?? "",
    instructorEmail: course.instructorEmail ?? "",
  };
}
