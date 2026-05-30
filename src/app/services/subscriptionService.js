import axiosInstance from "../api/axiosInstance";

export const subscriptionService = {
  // =========================================================================
  // SUBSCRIPTION PLAN ENDPOINTS (Quản lý Gói dịch vụ)
  // =========================================================================

  /**
   * Lấy danh sách tất cả các gói dịch vụ (Public)
   * @returns {Promise<Array>} Danh sách gói dịch vụ
   */
  getAllPlans: async () => {
    try {
      const response = await axiosInstance.get("/SubscriptionPlan");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách gói dịch vụ");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết gói dịch vụ theo ID (Manager)
   * @param {number} planId - ID của gói dịch vụ
   * @returns {Promise<object>} Chi tiết gói dịch vụ
   */
  getPlanById: async (planId) => {
    try {
      const response = await axiosInstance.get(`/SubscriptionPlan/${planId}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải chi tiết gói dịch vụ");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo gói dịch vụ mới (Manager)
   * @param {object} data - { planName, description, price, durationDays, maxUsers, ... }
   * @returns {Promise<object>} Gói dịch vụ vừa tạo
   */
  createPlan: async (data) => {
    try {
      const response = await axiosInstance.post("/SubscriptionPlan", data);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tạo gói dịch vụ mới");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật thông tin gói dịch vụ (Manager)
   * @param {number} planId - ID gói dịch vụ cần cập nhật
   * @param {object} data - Dữ liệu cập nhật
   * @returns {Promise<object>} Gói dịch vụ sau khi cập nhật
   */
  updatePlan: async (planId, data) => {
    try {
      const response = await axiosInstance.put(`/SubscriptionPlan/${planId}`, data);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể cập nhật gói dịch vụ");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa gói dịch vụ (Manager)
   * @param {number} planId - ID gói dịch vụ cần xóa
   * @returns {Promise<object>} Kết quả xóa
   */
  deletePlan: async (planId) => {
    try {
      const response = await axiosInstance.delete(`/SubscriptionPlan/${planId}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể xóa gói dịch vụ");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy tổng số người đăng ký sử dụng hệ thống (Manager Dashboard)
   * @returns {Promise<number>} Số lượng người đăng ký
   */
  getNumberOfSubscribers: async () => {
    try {
      const response = await axiosInstance.get("/SubscriptionPlan/NumberOfSubscribers");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải số liệu người đăng ký");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tính tổng doanh thu từ các gói đăng ký (Manager Dashboard)
   * @returns {Promise<number>} Tổng doanh thu
   */
  getTotalRevenue: async () => {
    try {
      const response = await axiosInstance.get("/SubscriptionPlan/CalculateTotalRevenue");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải dữ liệu tổng doanh thu");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy tổng giá trị tất cả giao dịch (Manager Dashboard)
   * @returns {Promise<number>} Tổng giá trị giao dịch
   */
  getTotalPrice: async () => {
    try {
      const response = await axiosInstance.get("/SubscriptionPlan/TotalPrice");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải dữ liệu tổng giá trị");
    } catch (error) {
      throw error;
    }
  },

  // =========================================================================
  // SUBSCRIPTION ENDPOINTS (Quản lý Đăng ký gói của User/Manager)
  // =========================================================================

  /**
   * Tạo đăng ký gói dịch vụ mới cho tài khoản hiện tại
   * @param {object} data - { planId, accountId, ... }
   * @returns {Promise<object>} Thông tin đăng ký vừa tạo (bao gồm subscriptionId)
   */
  createSubscription: async (data) => {
    try {
      const response = await axiosInstance.post("/Subscription", data);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tạo đăng ký gói dịch vụ");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách đăng ký gói dịch vụ của tài khoản hiện tại
   * @returns {Promise<Array>} Danh sách đăng ký
   */
  getMySubscriptions: async () => {
    try {
      const response = await axiosInstance.get("/Subscription/my-subscriptions");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách đăng ký");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết đăng ký gói theo ID
   * @param {number} subscriptionId - ID đăng ký
   * @returns {Promise<object>} Chi tiết đăng ký
   */
  getSubscriptionById: async (subscriptionId) => {
    try {
      const response = await axiosInstance.get(`/Subscription/${subscriptionId}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải chi tiết đăng ký");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật đăng ký gói (nâng cấp / thay đổi gói)
   * @param {number} subscriptionId - ID đăng ký
   * @param {object} data - Dữ liệu cập nhật
   * @returns {Promise<object>} Đăng ký sau khi cập nhật
   */
  updateSubscription: async (subscriptionId, data) => {
    try {
      const response = await axiosInstance.put(`/Subscription/${subscriptionId}`, data);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể cập nhật đăng ký");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Hủy đăng ký gói dịch vụ
   * @param {number} subscriptionId - ID đăng ký cần hủy
   * @returns {Promise<object>} Kết quả hủy
   */
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await axiosInstance.post(`/Subscription/${subscriptionId}/cancel`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể hủy đăng ký gói dịch vụ");
    } catch (error) {
      throw error;
    }
  },
};
