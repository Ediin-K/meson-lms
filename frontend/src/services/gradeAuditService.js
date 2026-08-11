import axiosInstance from "./axiosInstance";

export const getGradeHistory = async (gradeId) => {
  const { data } = await axiosInstance.get(`/grades/${gradeId}/history`);
  return data;
};

export const getGradeAuditLog = async (page = 0, size = 20) => {
  const { data } = await axiosInstance.get("/grades/audit-log", { params: { page, size } });
  return data;
};
