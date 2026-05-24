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
   * @param {object} progressData - { userId, lessonId, isCompleted }
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
  }
};

