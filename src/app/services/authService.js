import axiosInstance from "../api/axiosInstance";

/**
 * Giải mã JWT Token để lấy thông tin payload (UserId, Role, FullName, Email...)
 * Hàm thuần không phụ thuộc thư viện bên ngoài, hỗ trợ Unicode (tiếng Việt có dấu).
 * @param {string} token - Chuỗi JWT Token
 * @returns {object|null} Payload đã giải mã hoặc null nếu token không hợp lệ
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return null;
  }
};

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
        fullName: registerData.fullName,
        phoneNumber: registerData.phoneNumber,
        isAgreedToTerms: registerData.isAgreedToTerms
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
  },

  /**
   * Lấy vai trò (Role) của người dùng hiện tại từ Token đã lưu
   * @returns {string|null} "Admin", "Manager", "User" hoặc null
   */
  getCurrentRole: () => {
    const token = localStorage.getItem("token");
    const payload = decodeToken(token);
    return payload?.Role || payload?.role || null;
  },

  /**
   * Lấy UserId của người dùng hiện tại từ Token đã lưu
   * @returns {string|null} UserId dạng chuỗi hoặc null
   */
  getCurrentUserId: () => {
    const token = localStorage.getItem("token");
    const payload = decodeToken(token);
    return payload?.UserId || null;
  },

  /**
   * Lấy toàn bộ payload đã giải mã từ Token hiện tại
   * @returns {object|null} { UserId, Role, Email, FullName, exp, ... }
   */
  getTokenPayload: () => {
    const token = localStorage.getItem("token");
    return decodeToken(token);
  },
};
