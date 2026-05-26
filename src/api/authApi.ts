import { api } from "./client";
import type {
  ApiEnvelope,
  CurrentUserResponseData,
  LoginPayload,
  LoginResponseData,
  RefreshTokenResponseData,
  RegisterPayload,
  RegisterResponseData,
} from "../types/authTypes";

export const authApi = {
  register: async (data: RegisterPayload) => {
    const response = await api.post<ApiEnvelope<RegisterResponseData>>(
      "/users/register",
      data
    );

    return response.data;
  },

  login: async (data: LoginPayload) => {
    const response = await api.post<ApiEnvelope<LoginResponseData>>(
      "/users/login",
      data
    );

    return response.data;
  },

  getCurrentUser: async (): Promise<ApiEnvelope<CurrentUserResponseData>> => {
    const response = await api.get<ApiEnvelope<CurrentUserResponseData>>(
      "/users/current-user"
    );

    return response.data;
  },

  logout: async () => {
    const response = await api.post("/users/logout");

    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiEnvelope<RefreshTokenResponseData>>(
      "/users/refresh-token",
      { refreshToken }
    );

    return response.data;
  },

  uploadAvatar: async (
    uri: string,
    mimeType = "image/jpeg",
    fileName = "avatar.jpg"
  ) => {
    const formData = new FormData();
    formData.append("avatar", {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    const response = await api.patch<ApiEnvelope<CurrentUserResponseData>>(
      "/users/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};
