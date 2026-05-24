import axiosInstance from "../api/axiosInstance";

export const scenarioService = {
  /**
   * Lấy tất cả các kịch bản hòm thư giả lập
   */
  getAllScenarios: async () => {
    try {
      const response = await axiosInstance.get("/Scenarios");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách kịch bản");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết kịch bản theo ID
   * @param {number} id
   */
  getScenarioById: async (id) => {
    try {
      const response = await axiosInstance.get(`/Scenarios/${id}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải kịch bản chi tiết");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Nộp kết quả làm bài của kịch bản giả lập
   * @param {object} attemptData - { scenarioId, answeredCorrectly, isPhishingSelected }
   */
  submitAttempt: async (attemptData) => {
    try {
      const response = await axiosInstance.post("/Scenarios/submit-attempt", attemptData);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể nộp kết quả kịch bản");
    } catch (error) {
      throw error;
    }
  }
};
