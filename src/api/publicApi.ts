import { api } from "./client";
import type {
  PublicApiEnvelope,
  RandomProduct,
  RandomUser,
} from "../types/courseTypes";

export const publicApi = {
  getRandomUsers: async (limit = 10) => {
    const response = await api.get<PublicApiEnvelope<RandomUser>>(
      "/public/randomusers",
      { params: { limit } }
    );

    return response.data;
  },

  getRandomProducts: async (limit = 10) => {
    const response = await api.get<PublicApiEnvelope<RandomProduct>>(
      "/public/randomproducts",
      { params: { limit } }
    );

    return response.data;
  },
};
