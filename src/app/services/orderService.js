import axiosInstance from "../api/axiosInstance";

export const orderService = {
  /**
   * Tạo đơn hàng cho luồng INDIVIDUAL (user lẻ không thuộc company).
   * BE tự tạo Subscription(CompanyId=null) + Order trong 1 call.
   * @param {number} planId
   * @returns {Promise<{orderId, amount, content, qrUrl}>}
   */
  createOrderIndividual: async (planId) => {
    // QR endpoints trả raw object { orderId, amount, content, qrUrl }, không wrap ApiResponse
    return await axiosInstance.post("/QR/create-order-individual", { planId });
  },

  /**
   * Tạo đơn hàng cho luồng COMPANY (Manager đã tạo Subscription trước).
   * @param {number} subscriptionId
   * @returns {Promise<{orderId, amount, content, qrUrl}>}
   */
  createOrderCompany: async (subscriptionId) => {
    return await axiosInstance.post("/QR/create-order", { subscriptionId });
  },

  /**
   * Poll trạng thái thanh toán của đơn hàng.
   * @param {number} orderId
   * @returns {Promise<{orderId, status}>}  status: "Pending" | "Paid"
   */
  getOrderStatus: async (orderId) => {
    return await axiosInstance.get(`/QR/status/${orderId}`);
  },

  cancelPending: async () => {
    return await axiosInstance.delete("/QR/cancel-pending");
  },

  createOrderBusinessUpgrade: async (planId) => {
    return await axiosInstance.post("/QR/create-order-business-upgrade", { planId });
  },

  /**
   * Lấy chi tiết đơn hàng theo ID.
   * @param {number} orderId
   * @returns {Promise<object>}
   */
  getOrderDetails: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      if (response && response.isSuccess) return response.result;
      throw new Error(response?.errorMessage || "Không thể tải chi tiết đơn hàng");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại.
   * @returns {Promise<Array>}
   */
  getMyOrders: async () => {
    try {
      const response = await axiosInstance.get("/orders/my-orders");
      if (response && response.isSuccess) return response.result;
      throw new Error(response?.errorMessage || "Không thể tải danh sách đơn hàng");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Hủy đơn hàng chưa thanh toán.
   * @param {number} orderId
   * @returns {Promise<object>}
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.put(`/orders/cancel/${orderId}`);
      if (response && response.isSuccess) return response.result;
      throw new Error(response?.errorMessage || "Không thể hủy đơn hàng");
    } catch (error) {
      throw error;
    }
  },
};
