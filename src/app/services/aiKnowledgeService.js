import axiosInstance from "../api/axiosInstance";

// Các endpoint /api/ai-knowledge trả Ok(dto) trực tiếp — KHÔNG dùng ApiResponse wrapper
export const aiKnowledgeService = {
  getAll: () => axiosInstance.get("ai-knowledge"),

  searchByTag: (tag) => axiosInstance.get(`ai-knowledge/search?tag=${encodeURIComponent(tag)}`),

  create: (data) => axiosInstance.post("ai-knowledge", data),
};
