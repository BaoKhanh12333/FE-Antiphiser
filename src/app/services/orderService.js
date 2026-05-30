import axiosInstance from "../api/axiosInstance";

export const orderService = {
  /**
   * Tạo đơn hàng mới từ đăng ký gói Subscription
   * @param {object} data - { subscriptionId }
   * @returns {Promise<object>} Thông tin đơn hàng vừa tạo (orderId, amount, status...)
   */
  createOrder: async (data) => {
    try {
      const response = await axiosInstance.post("/orders/create", data);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tạo đơn hàng");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<object>} Chi tiết đơn hàng
   */
  getOrderDetails: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải chi tiết đơn hàng");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả đơn hàng của người dùng hiện tại
   * @returns {Promise<Array>} Danh sách đơn hàng
   */
  getMyOrders: async () => {
    try {
      const response = await axiosInstance.get("/orders/my-orders");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách đơn hàng");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Hủy đơn hàng (chỉ có thể hủy nếu chưa thanh toán)
   * @param {number} orderId - ID đơn hàng cần hủy
   * @returns {Promise<object>} Kết quả hủy
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.put(`/orders/cancel/${orderId}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể hủy đơn hàng");
    } catch (error) {
      throw error;
    }
  },
};
