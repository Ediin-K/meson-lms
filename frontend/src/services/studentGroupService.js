import axiosInstance from "./axiosInstance";

export const getStudentScheduleOverview = async (userId) => {
  const response = await axiosInstance.get(`/student/${userId}/schedule-overview`);
  return response.data;
};

export const getStudentGroupStatus = async (userId) => {
  const response = await axiosInstance.get(`/student/${userId}/groups/status`);
  return response.data;
};

export const getAvailableGroups = async (userId) => {
  const response = await axiosInstance.get(`/student/${userId}/groups/available`);
  return response.data;
};

export const selectGroup = async (userId, departmentGroupId) => {
  const response = await axiosInstance.post(`/student/${userId}/groups/select`, { departmentGroupId });
  return response.data;
};

export const assignStudentToGroup = async (userId, departmentGroupId) => {
  const response = await axiosInstance.post(`/admin/students/${userId}/assign-group`, {
    departmentGroupId,
  });
  return response.data;
};

export const removeStudentFromGroup = async (userId) => {
  await axiosInstance.delete(`/admin/students/${userId}/assign-group`);
};
