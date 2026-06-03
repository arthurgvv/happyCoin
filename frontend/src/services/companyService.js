import { apiRequest } from "./apiClient.js";

export const companyService = {
  me() {
    return apiRequest("/companies/me");
  },

  update(payload) {
    return apiRequest("/companies/me", { method: "PUT", body: payload });
  },

  inbox() {
    return apiRequest("/companies/me/inbox");
  },

  markRead(id) {
    return apiRequest(`/companies/me/inbox/${id}/read`, { method: "PUT" });
  },
};
