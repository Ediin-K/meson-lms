import axiosInstance from './axiosInstance'

export const getAvailableExamCourses = async () => {
  const { data } = await axiosInstance.get('/smis/courses/available')
  return data
}

export const registerExam = async (studentId, payload) => {
  const { data } = await axiosInstance.post(`/smis/students/${studentId}/exam-applications`, payload)
  return data
}

export const getStudentExamApplications = async (studentId) => {
  const { data } = await axiosInstance.get(`/smis/students/${studentId}/exam-applications`)
  return data
}

export const cancelExamApplication = async (studentId, applicationId) => {
  const { data } = await axiosInstance.patch(`/smis/students/${studentId}/exam-applications/${applicationId}/cancel`)
  return data
}

export const refuseExamGrade = async (studentId, applicationId) => {
  const { data } = await axiosInstance.patch(`/smis/students/${studentId}/exam-applications/${applicationId}/refuse-grade`)
  return data
}

export const getProfessorExamApplications = async () => {
  const { data } = await axiosInstance.get('/smis/professor/exam-applications')
  return data
}

export const submitExamGrade = async (applicationId, payload) => {
  const { data } = await axiosInstance.patch(`/smis/professor/exam-applications/${applicationId}/grade`, payload)
  return data
}

export const deleteExamGrade = async (applicationId) => {
  const { data } = await axiosInstance.delete(`/smis/professor/exam-applications/${applicationId}/grade`)
  return data
}

export const getAdminExamApplications = async (status = '') => {
  const params = status ? { status } : {}
  const { data } = await axiosInstance.get('/smis/admin/exam-applications', { params })
  return data
}

export const getAdminSmisSummary = async () => {
  const { data } = await axiosInstance.get('/smis/admin/summary')
  return data
}
