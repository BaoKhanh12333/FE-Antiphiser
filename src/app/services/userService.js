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

  getAllAccounts: async (searchTerm = "", pageIndex = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/UserAccount/GetAllAccountAsync?searchTerm=${searchTerm}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể lấy danh sách tải khoản");
    } catch (error) {
      throw error;
    }
  },

  updateUserStatusOrRole: async (data) => {
    try {
      // data: { userId, roleId, status, systemScore, riskLevel }
      const response = await axiosInstance.put("/UserAccount/UpdateUserStatusOrRole", data);
      return response;
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
  },

  /**
   * Lấy danh sách tất cả tài khoản trong đội ngũ (Manager)
   * @returns {Promise<Array>} Danh sách tài khoản người dùng
   */
  getAllTeamAccounts: async () => {
    try {
      const response = await axiosInstance.get("/UserAccount/GetAllAccountAsync");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách tài khoản đội ngũ");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Manager: lấy nhân viên cùng công ty (RoleId=3, cùng CompanyId).
   * Trả về CompanyEmployeePagedResponse { items, totalCount, pageIndex, pageSize }.
   */
  getCompanyEmployees: async (pageIndex = 1, pageSize = 100) => {
    try {
      const response = await axiosInstance.get(
        `/UserAccount/company-employees?pageIndex=${pageIndex}&pageSize=${pageSize}`
      );
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách nhân viên");
    } catch (error) {
      throw error;
    }
  },
};
