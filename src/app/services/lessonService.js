import axiosInstance from "../api/axiosInstance";

export const lessonService = {
  /**
   * Lấy danh sách tất cả các bài học lý thuyết
   */
  getAllLessons: async () => {
    try {
      const response = await axiosInstance.get("/Lesson");
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải danh sách bài học");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết một bài học theo ID
   * @param {number} lessonId
   */
  getLessonById: async (lessonId) => {
    try {
      const response = await axiosInstance.get(`/Lesson/${lessonId}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải chi tiết bài học");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật tiến độ bài học của người dùng (Đánh dấu hoàn thành / chưa hoàn thành)
   * userId lấy từ JWT token phía backend — không truyền vào đây.
   * @param {object} progressData - { lessonId, isCompleted }
   */
  trackProgress: async (progressData) => {
    try {
      const response = await axiosInstance.post("/Lesson/track-progress", progressData);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể cập nhật tiến độ bài học");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy tiến độ học lý thuyết của một người dùng cụ thể
   * @param {number} userId
   */
  getUserProgress: async (userId) => {
    try {
      const response = await axiosInstance.get(`/Lesson/user-progress/${userId}`);
      if (response && response.isSuccess) {
        return response.result;
      }
      throw new Error(response?.errorMessage || "Không thể tải tiến độ học tập");
    } catch (error) {
      throw error;
    }
  },

  /**
   * Tạo bài học lý thuyết mới (Admin)
   * @param {object} data - { lessonTitle, content, phaseId, moduleId, orderIndex, ... }
   * @returns {Promise<object>} Bài học vừa tạo
   */
  createLesson: async (data) => {
    try {
      const response = await axiosInstance.post("/Lesson", data);
      // LessonController trả về 201 CreatedAtAction, không wrap ApiResponse
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Kiểm tra điều kiện User có đủ tiêu chuẩn tham gia chiến dịch thực hành không
   * (Đã hoàn thành đầy đủ các bài học lý thuyết tiên quyết)
   * userId lấy từ JWT token phía backend — không truyền vào đây.
   * @param {number} campaignId - ID chiến dịch
   * @returns {Promise<boolean>} true nếu đủ điều kiện, false nếu chưa
   */
  checkEligibility: async (campaignId) => {
    try {
      const response = await axiosInstance.get(
        `/Lesson/check-eligibility?campaignId=${campaignId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cấu hình danh sách bài học lý thuyết tiên quyết cho chiến dịch (Admin)
   * @param {number} campaignId - ID chiến dịch
   * @param {number[]} lessonIds - Danh sách ID bài học bắt buộc
   * @returns {Promise<object>} Kết quả cấu hình
   */
  setPrerequisites: async (campaignId, lessonIds) => {
    try {
      const response = await axiosInstance.post("/Lesson/set-prerequisites", {
        campaignId,
        lessonIds,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};
