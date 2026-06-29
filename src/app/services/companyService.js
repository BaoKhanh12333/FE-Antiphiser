import axiosInstance from "../api/axiosInstance";

export const companyService = {
  getMyCompany: async () => {
    try {
      const response = await axiosInstance.get("/Company/my-company");
      if (response && response.isSuccess) return response.result;
      return null;
    } catch {
      return null;
    }
  },

  /** Gửi lời mời tham gia công ty qua email (hỗ trợ email mới & đã có tài khoản) */
  inviteEmployee: async ({ email, fullName }) => {
    try {
      const response = await axiosInstance.post("/Company/invite-employee", { email, fullName });
      if (response && response.isSuccess) return response.result;
      throw new Error(response?.errorMessage || "Không thể gửi lời mời");
    } catch (error) {
      throw error;
    }
  },

  /** Cập nhật tên công ty (dùng ngay sau khi mua gói, trước khi refresh token) */
  updateCompanyName: async (companyName) => {
    try {
      const response = await axiosInstance.put("/Company/update-name", { companyName });
      if (response && response.isSuccess) return response.result;
      throw new Error(response?.errorMessage || "Không thể cập nhật tên công ty");
    } catch (error) {
      throw error;
    }
  },

  /** Nhân viên xác nhận lời mời bằng token trong email */
  acceptInvitation: async (token) => {
    try {
      const response = await axiosInstance.post(`/Company/accept-invite?token=${encodeURIComponent(token)}`);
      if (response && response.isSuccess) return response.result;
      throw new Error(response?.errorMessage || "Xác nhận thất bại");
    } catch (error) {
      throw error;
    }
  },
};
