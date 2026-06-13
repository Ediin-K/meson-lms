import axiosInstance from "./axiosInstance";

const GRADES_API = "/grades";

export const getGradesByStudent = async (studentId) => {
  const response = await axiosInstance.get(`${GRADES_API}/student/${studentId}`);
  return response.data;
};

export const getGradesBySubject = async (subjectId) => {
  const response = await axiosInstance.get(`${GRADES_API}/subject/${subjectId}`);
  return response.data;
};

export const createGrade = async (gradeData) => {
  const response = await axiosInstance.post(GRADES_API, gradeData);
  return response.data;
};

export const updateGrade = async (id, gradeData) => {
  const response = await axiosInstance.put(`${GRADES_API}/${id}`, gradeData);
  return response.data;
};

export const deleteGrade = async (id) => {
  await axiosInstance.delete(`${GRADES_API}/${id}`);
};
