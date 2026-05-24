import axiosInstance from "../api/axiosInstance";

export const authService = {
  /**
   * Đăng nhập người dùng
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("/Auth/login", {
        userEmail: email,
        password: password,
      });

      // Nếu đăng nhập thành công (isSuccess = true) và có Token
      if (response && response.isSuccess && response.result) {
        const token = response.result;
        // Lưu token vào localStorage
        localStorage.setItem("token", token);
        return response;
      }
      throw new Error(response?.errorMessage || "Đăng nhập thất bại");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng ký tài khoản mới
   * @param {object} registerData - { email, password, confirmPassword, fullName, roleId, roleName }
   */
  register: async (registerData) => {
    try {
      const response = await axiosInstance.post("/Auth/register", {
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
        fullName: registerData.fullName,
        role: {
          roleId: parseInt(registerData.roleId) || 1, // Mặc định là 1 (User/Nhân viên)
          roleName: registerData.roleName || "User"
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xác thực mã OTP gửi về Email sau khi đăng ký
   * @param {number} userId
   * @param {string} verificationCode
   */
  verifyEmail: async (userId, verificationCode) => {
    try {
      return await axiosInstance.post("/Auth/Verification", {
        userId: parseInt(userId),
        verificationCode: verificationCode.trim()
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng xuất hệ thống
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/dang-nhap";
  },

  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }
};
