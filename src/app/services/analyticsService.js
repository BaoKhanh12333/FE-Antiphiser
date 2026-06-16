import axiosInstance from "../api/axiosInstance";

export const analyticsService = {
  /**
   * Tổng quan hiệu suất bảo mật toàn công ty (dành cho Manager).
   * @returns {{ totalEmployees, activeEmployees, totalAttempts, overallDetectionRate,
   *             avgRiskScore, lessonCompletionRate, riskDistribution, heatmap,
   *             totalClickedLink, totalCredentialLeaked, totalReported, avgDetectionSeconds }}
   */
  getCompanyOverview: async () => {
    try {
      const response = await axiosInstance.get("/Analytics/company-overview");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải tổng quan công ty");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Danh sách nhân viên nguy hiểm nhất (risk score thấp nhất lên đầu).
   * @returns {Array<{ userId, fullName, email, riskScore, riskLevel, totalAttempts,
   *                   correctAttempts, detectionRate, clickedLinkCount,
   *                   credentialLeakedCount, reportedCount,
   *                   completedLessons, totalAssignedLessons, lessonCompletionPct,
   *                   lastAttemptAt }>}
   */
  getHighRiskEmployees: async () => {
    try {
      const response = await axiosInstance.get("/Analytics/high-risk-employees");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách nhân viên");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tiến độ hoàn thành từng Campaign của công ty.
   * @returns {{ campaigns: Array<{ campaignId, campaignName, status, totalAssignedUsers,
   *                                totalRequiredLessons, lessonCompletionPct,
   *                                totalAttempts, avgAttemptScore, detectionRate,
   *                                userSummaries }> }}
   */
  getCampaignCompletion: async () => {
    try {
      const response = await axiosInstance.get("/Analytics/campaign-completion");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải tiến độ chiến dịch");
    } catch (error) {
      throw error;
    }
  },

  getAdminOverview: async () => {
    try {
      const response = await axiosInstance.get("/Analytics/admin-overview");
      if (response && response.isSuccess) return response.result;
      throw new Error(response?.errorMessage || "Không thể tải tổng quan admin");
    } catch (error) {
      throw error;
    }
  },
};
