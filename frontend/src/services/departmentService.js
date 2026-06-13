import axiosInstance from "./axiosInstance";

const DEPARTMENT_API = "/departments";

export const getAllDepartments = async () => {
  const response = await axiosInstance.get(DEPARTMENT_API);
  return response.data;
};

export const getDepartment = async (id) => {
  const response = await axiosInstance.get(`${DEPARTMENT_API}/${id}`);
  return response.data;
};

export const createDepartment = async (department) => {
  const response = await axiosInstance.post(DEPARTMENT_API, department);
  return response.data;
};

export const updateDepartment = async (id, department) => {
  const response = await axiosInstance.put(`${DEPARTMENT_API}/${id}`, department);
  return response.data;
};

export const deleteDepartment = async (id) => {
  await axiosInstance.delete(`${DEPARTMENT_API}/${id}`);
};
