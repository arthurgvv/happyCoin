import { apiRequest } from "./apiClient.js";

export const institutionService = {
  me() {
    return apiRequest("/institutions/me");
  },

  update(payload) {
    return apiRequest("/institutions/me", { method: "PUT", body: payload });
  },

  professors() {
    return apiRequest("/institutions/me/professors");
  },

  createProfessor(payload) {
    return apiRequest("/institutions/me/professors", { method: "POST", body: payload });
  },

  updateProfessor(professorId, payload) {
    return apiRequest(`/institutions/me/professors/${professorId}`, { method: "PUT", body: payload });
  },

  deleteProfessor(professorId) {
    return apiRequest(`/institutions/me/professors/${professorId}`, { method: "DELETE" });
  },

  students() {
    return apiRequest("/institutions/me/students");
  },

  startSemester() {
    return apiRequest("/institutions/me/semester/start", { method: "POST" });
  },

  companies() {
    return apiRequest("/institutions/me/companies");
  },
};
