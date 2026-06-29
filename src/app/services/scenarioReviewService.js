import axiosInstance from "../api/axiosInstance";

// Endpoint trả Ok(dto) trực tiếp — KHÔNG dùng ApiResponse wrapper
export const scenarioReviewService = {
  getPending: () => axiosInstance.get("scenario-review/pending"),

  approve: (scenarioId) => axiosInstance.post(`scenario-review/${scenarioId}/approve`),

  reject: (scenarioId, reason) =>
    axiosInstance.post(`scenario-review/${scenarioId}/reject`, { reason }),
};
