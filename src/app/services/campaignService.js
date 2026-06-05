import axiosInstance from "../api/axiosInstance";

export const campaignService = {
  /**
   * Lấy tất cả chiến dịch học tập/mô phỏng
   */
  getAllCampaigns: async () => {
    try {
      const response = await axiosInstance.get("/Campaigns");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách chiến dịch");
    } catch (error) {
      throw error;
    }
  },

  getMyCampaigns: async () => {
    try {
      const response = await axiosInstance.get("/Campaigns/my-campaigns");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải chiến dịch được giao");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết chiến dịch theo ID
   * @param {number} id
   */
  getCampaignById: async (id) => {
    try {
      const response = await axiosInstance.get(`/Campaigns/${id}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải chi tiết chiến dịch");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo chiến dịch đào tạo mới (Admin/Manager)
   * @param {object} data - { campaignName, description, scenarioIds, startDate, endDate, ... }
   * @returns {Promise<object>} Chiến dịch vừa tạo
   */
  createCampaign: async (data) => {
    try {
      const response = await axiosInstance.post("/Campaigns", data);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tạo chiến dịch mới");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa chiến dịch đào tạo theo ID (Admin/Manager)
   * @param {number} id - ID chiến dịch cần xóa
   * @returns {Promise<object>} Kết quả xóa
   */
  deleteCampaign: async (id) => {
    try {
      const response = await axiosInstance.delete(`/Campaigns/${id}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể xóa chiến dịch");
    } catch (error) {
      throw error;
    }
  }
};
