export interface RandomUserName {
  title: string;
  first: string;
  last: string;
}

export interface RandomUserPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface RandomUser {
  id: number;
  name: RandomUserName;
  email: string;
  picture: RandomUserPicture;
}

export interface RandomProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  brand: string;
  category: string;
  thumbnail: string;
}

export interface PaginatedPayload<T> {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}

export interface PublicApiEnvelope<T> {
  statusCode: number;
  data: PaginatedPayload<T>;
  message: string;
  success: boolean;
}

export interface CourseListItem {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  rating: number;
  category: string;
  instructorName: string;
  instructorAvatar: string;
}

export interface CourseDetail extends CourseListItem {
  price: number;
  brand: string;
  instructorEmail: string;
}
