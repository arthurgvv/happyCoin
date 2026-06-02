import { apiRequest } from "./apiClient.js";

export const professorService = {
  me() {
    return apiRequest("/professors/me");
  },

  update(payload) {
    return apiRequest("/professors/me", { method: "PUT", body: payload });
  },

  courses() {
    return apiRequest("/professors/me/courses");
  },

  studentsByCourse(course) {
    return apiRequest(`/professors/me/courses/${encodeURIComponent(course)}/students`);
  },

  transfer(payload) {
    return apiRequest("/professors/transfer", { method: "POST", body: payload });
  },

  transfers() {
    return apiRequest("/professors/me/transfers");
  },

  sendEmail(payload) {
    return apiRequest("/professors/me/send-email", { method: "POST", body: payload });
  },

  inbox() {
    return apiRequest("/professors/me/inbox");
  },

  sent() {
    return apiRequest("/professors/me/sent");
  },

  markRead(id) {
    return apiRequest(`/professors/me/inbox/${id}/read`, { method: "PUT" });
  },
};
