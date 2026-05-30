import axiosInstance from "../api/axiosInstance";

export const paymentService = {
  /**
   * Tạo URL thanh toán qua cổng VNPAY
   * Backend sẽ ký mã hóa đơn và trả về đường link redirect sang trang VNPAY.
   * Sau khi người dùng hoàn tất thanh toán, VNPAY sẽ gọi callback về BE,
   * rồi BE điều hướng người dùng về /paymentsuccess hoặc /paymentfail.
   *
   * @param {object} model - { orderId, amount, orderDescription, ... }
   * @returns {Promise<string>} URL thanh toán VNPAY để redirect trình duyệt
   */
  createPaymentUrl: async (model) => {
    try {
      const response = await axiosInstance.post("/Payment", model);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tạo đường link thanh toán VNPAY");
    } catch (error) {
      throw error;
    }
  },
};
