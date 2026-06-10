import axiosInstance from "../api/axiosInstance";

export const phaseService = {
  getAll: async () => {
    const res = await axiosInstance.get("/Phase");
    if (res && res.isSuccess) return res.result;
    throw new Error(res?.errorMessage || "Không thể tải danh sách phase");
  },

  create: async (data) => {
    const res = await axiosInstance.post("/Phase", data);
    if (res && res.isSuccess) return res.result;
    throw new Error(res?.errorMessage || "Không thể tạo phase");
  },

  update: async (id, data) => {
    const res = await axiosInstance.put(`/Phase/${id}`, data);
    if (res && res.isSuccess) return res.result;
    throw new Error(res?.errorMessage || "Không thể cập nhật phase");
  },

  createModule: async (phaseId, data) => {
    const res = await axiosInstance.post(`/Phase/${phaseId}/modules`, data);
    if (res && res.isSuccess) return res.result;
    throw new Error(res?.errorMessage || "Không thể tạo module");
  },
};
