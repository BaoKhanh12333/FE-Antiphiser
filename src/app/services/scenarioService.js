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
  getMyAttempts: async (campaignId) => {
    try {
      const response = await axiosInstance.get(`/Scenarios/my-campaign-attempts?campaignId=${campaignId}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải lịch sử làm bài");
    } catch (error) {
      throw error;
    }
  },

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
  },

  /**
   * Tạo kịch bản mô phỏng mới (Admin)
   * @param {object} data - { scenarioName, senderEmail, senderName, subject, body, isPhishing, ... }
   * @returns {Promise<object>} Kịch bản vừa tạo
   */
  createScenario: async (data) => {
    try {
      const response = await axiosInstance.post("/Scenarios", data);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tạo kịch bản mới");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật kịch bản mô phỏng (Admin)
   * @param {number} id - ID kịch bản cần cập nhật
   * @param {object} data - Dữ liệu cập nhật
   * @returns {Promise<object>} Kịch bản sau khi cập nhật
   */
  updateScenario: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/Scenarios/${id}`, data);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể cập nhật kịch bản");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo kịch bản công ty (Manager) — gắn CreatedByUserId, chỉ hiện trong nội bộ công ty
   * @param {object} data - CreateScenarioRequest fields
   */
  createCompanyScenario: async (data) => {
    try {
      const response = await axiosInstance.post("/Scenarios/company", data);
      if (response && response.isSuccess) return response.result;
      throw new Error(response?.errorMessage || "Không thể tạo kịch bản");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa kịch bản mô phỏng (Admin)
   * @param {number} id - ID kịch bản cần xóa
   * @returns {Promise<object>} Kết quả xóa
   */
  deleteScenario: async (id) => {
    try {
      const response = await axiosInstance.delete(`/Scenarios/${id}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể xóa kịch bản");
    } catch (error) {
      throw error;
    }
  }
};
