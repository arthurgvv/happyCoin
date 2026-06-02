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

  professors() {
    return apiRequest("/students/me/professors");
  },

  sendEmail(payload) {
    return apiRequest("/students/me/send-email", { method: "POST", body: payload });
  },

  inbox() {
    return apiRequest("/students/me/inbox");
  },

  sent() {
    return apiRequest("/students/me/sent");
  },

  markRead(id) {
    return apiRequest(`/students/me/inbox/${id}/read`, { method: "PUT" });
  },
};
