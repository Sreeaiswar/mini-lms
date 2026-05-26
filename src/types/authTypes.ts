export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  role?: string;
}

export interface UserAvatar {
  url: string;
  localPath?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: UserAvatar;
  role?: string;
  isEmailVerified?: boolean;
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponseData {
  user: User;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

/** GET /users/current-user returns the user document directly in `data`. */
export type CurrentUserResponseData = User;

export interface UserStatistics {
  coursesEnrolled: number;
  coursesCompleted: number;
  progressPercent: number;
}
