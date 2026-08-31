import axiosInstance from "./axiosInstance";

export const getDashboard = async () => {
  const { data } = await axiosInstance.get("/department-head/dashboard");
  return data;
};

export const getStudents = async () => {
  const { data } = await axiosInstance.get("/department-head/students");
  return data;
};

export const getSubjects = async () => {
  const { data } = await axiosInstance.get("/department-head/subjects");
  return data;
};
