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
  }
};
