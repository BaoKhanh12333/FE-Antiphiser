import axiosInstance from "../api/axiosInstance";

// Tất cả endpoint trả Ok(dto) trực tiếp — KHÔNG dùng ApiResponse wrapper
export const campaignGeneratorService = {
  // Giai đoạn 4: Sinh từ ngữ cảnh AIExpandedKnowledge
  generatePreview: (knowledgeId, difficultyId) =>
    axiosInstance.post(`campaign-generator/preview?knowledgeId=${knowledgeId}&difficultyId=${difficultyId}`),

  saveScenario: (data) => axiosInstance.post("campaign-generator/save", data),

  // Giai đoạn 5: Sinh biến thể từ các Scenario có sẵn
  generateSimilar: (data) => axiosInstance.post("template-expansion/generate-similar", data),

  saveSimilarScenario: (data) => axiosInstance.post("template-expansion/save", data),
};
