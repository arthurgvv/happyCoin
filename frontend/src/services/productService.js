import { apiRequest } from "./apiClient.js";

export const productService = {
  list() {
    return apiRequest("/products");
  },

  listMine() {
    return apiRequest("/products/mine");
  },

  create(payload) {
    return apiRequest("/products", {
      method: "POST",
      body: payload,
    });
  },

  remove(id) {
    return apiRequest(`/products/${id}`, {
      method: "DELETE",
    });
  },

  purchase(id) {
    return apiRequest(`/products/${id}/purchase`, { method: "POST" });
  },

  update(id, payload) {
    return apiRequest(`/products/${id}`, { method: "PUT", body: payload });
  },

  purchases() {
    return apiRequest("/products/purchases");
  },
};
