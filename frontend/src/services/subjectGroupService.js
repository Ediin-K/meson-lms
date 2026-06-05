import axiosInstance from "./axiosInstance";

export const getSubjectGroups = async (subjectId) => {
  const response = await axiosInstance.get(`/subjects/${subjectId}/groups`);
  return response.data;
};

export const createSubjectGroup = async (subjectId, payload) => {
  const response = await axiosInstance.post(`/subjects/${subjectId}/groups`, payload);
  return response.data;
};

export const updateSubjectGroup = async (groupId, payload) => {
  const response = await axiosInstance.put(`/subject-groups/${groupId}`, payload);
  return response.data;
};

export const deleteSubjectGroup = async (groupId) => {
  await axiosInstance.delete(`/subject-groups/${groupId}`);
};

export const createSubjectSubgroup = async (groupId, payload) => {
  const response = await axiosInstance.post(`/subject-groups/${groupId}/subgroups`, payload);
  return response.data;
};

export const updateSubjectSubgroup = async (subgroupId, payload) => {
  const response = await axiosInstance.put(`/subject-subgroups/${subgroupId}`, payload);
  return response.data;
};

export const deleteSubjectSubgroup = async (subgroupId) => {
  await axiosInstance.delete(`/subject-subgroups/${subgroupId}`);
};
