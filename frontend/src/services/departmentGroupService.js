import axiosInstance from "./axiosInstance";

export const getDepartmentGroups = async (departmentId, semester) => {
  const params = semester != null ? { semester } : {};
  const response = await axiosInstance.get(`/departments/${departmentId}/department-groups`, { params });
  return response.data;
};

export const getWizardContext = async (departmentId, semester) => {
  const response = await axiosInstance.get("/admin/department-groups/wizard/context", {
    params: { departmentId, semester },
  });
  return response.data;
};

export const createGroupWizard = async (payload) => {
  const response = await axiosInstance.post("/admin/department-groups/wizard", payload);
  return response.data;
};

export const getDepartmentGroupDetail = async (departmentGroupId) => {
  const response = await axiosInstance.get(`/admin/department-groups/${departmentGroupId}/detail`);
  return response.data;
};

export const updateDepartmentGroup = async (groupId, payload) => {
  const response = await axiosInstance.put(`/department-groups/${groupId}`, payload);
  return response.data;
};

export const deleteDepartmentGroup = async (groupId) => {
  await axiosInstance.delete(`/department-groups/${groupId}`);
};

export const getDepartmentGroupMembers = async (groupId) => {
  const response = await axiosInstance.get(`/department-groups/${groupId}/students`);
  return response.data;
};

export const GROUP_STATUS = {
  ACTIVE: "ACTIVE",
  FULL: "FULL",
  CLOSED: "CLOSED",
};

export const statusChipColor = (status) => {
  if (status === GROUP_STATUS.FULL) return "warning";
  if (status === GROUP_STATUS.CLOSED) return "default";
  return "success";
};
