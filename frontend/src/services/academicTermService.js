import axiosInstance from "./axiosInstance";

const ACADEMIC_TERM_API = "/academic-terms";

export const getAllAcademicTerms = async () => {
  const response = await axiosInstance.get(ACADEMIC_TERM_API);
  return response.data;
};

export const createAcademicTerm = async (term) => {
  const response = await axiosInstance.post(ACADEMIC_TERM_API, term);
  return response.data;
};

export const updateAcademicTerm = async (id, term) => {
  const response = await axiosInstance.put(`${ACADEMIC_TERM_API}/${id}`, term);
  return response.data;
};

export const activateAcademicTerm = async (id) => {
  const response = await axiosInstance.patch(`${ACADEMIC_TERM_API}/${id}/activate`);
  return response.data;
};

export const deleteAcademicTerm = async (id) => {
  await axiosInstance.delete(`${ACADEMIC_TERM_API}/${id}`);
};
