import axiosInstance from "../api/axiosInstance";

export const userService = {
  /**
   * Lấy thông tin cá nhân của người dùng hiện tại từ API
   */
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get("/UserAccount/GetUserProfile");
      if (response && response.isSuccess) {
        const profile = response.result;
        // Lưu thông tin user vào localStorage để hiển thị nhanh trên UI
        localStorage.setItem("user", JSON.stringify(profile));
        return profile;
      }
      throw new Error(response?.errorMessage || "Không thể lấy thông tin cá nhân");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật thông tin cá nhân người dùng
   * @param {object} profileData - { fullName, avatarUrl, companyId }
   */
  updateUserProfile: async (profileData) => {
    try {
      return await axiosInstance.put("/UserAccount/UpdateUserProfile", profileData);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thông tin user hiện hành đã lưu trong localStorage
   */
  getCurrentUser: () => {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  }
};
