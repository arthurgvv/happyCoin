import { apiRequest } from "./apiClient.js";

export const studentService = {
  me() {
    return apiRequest("/students/me");
  },

  list() {
    return apiRequest("/students");
  },

  institutions() {
    return apiRequest("/students/institutions");
  },

  courses() {
    return apiRequest("/catalog/courses");
  },

  updateMe(payload) {
    return apiRequest("/students/me", { method: "PUT", body: payload });
  },

  transfers() {
    return apiRequest("/students/me/transfers");
  },

  purchases() {
    return apiRequest("/students/me/purchases");
  },
};
