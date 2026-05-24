import axios from "axios";

// Tạo instance của axios với Base URL của Backend
const axiosInstance = axios.create({
  baseURL: "http://localhost:5245/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor tự động đính kèm token JWT (Bearer Token) vào Header của mỗi Request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi tập trung khi nhận Response
axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu API trả về thành công, trả thẳng dữ liệu kết quả (unwrap ApiResponse)
    return response.data;
  },
  (error) => {
    // Xử lý các mã lỗi HTTP phổ biến
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        console.warn("Unauthorized! Redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Có thể cấu hình chuyển hướng người dùng về trang đăng nhập nếu token hết hạn:
        // window.location.href = "/dang-nhap";
      } else if (status === 403) {
        console.error("Forbidden! You don't have permission to perform this action.");
      }

      // Trả về lỗi đã được đóng gói từ Backend (nếu có ApiResponse)
      const errorMessage = data?.errorMessage || data?.message || "Đã xảy ra lỗi hệ thống!";
      return Promise.reject({
        status,
        message: errorMessage,
        data,
      });
    }

    return Promise.reject({
      status: 500,
      message: "Không thể kết nối đến máy chủ API Backend. Vui lòng kiểm tra lại!",
    });
  }
);

export default axiosInstance;
