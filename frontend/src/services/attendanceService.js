import axiosInstance from "./axiosInstance";

const ATTENDANCE_API = "/attendance";

export const getRoster = async (scheduleSessionId, date) => {
  const response = await axiosInstance.get(`${ATTENDANCE_API}/sessions/${scheduleSessionId}/roster`, {
    params: { date },
  });
  return response.data;
};

export const markAttendance = async (scheduleSessionId, date, marks) => {
  await axiosInstance.post(`${ATTENDANCE_API}/sessions/${scheduleSessionId}/mark`, marks, {
    params: { date },
  });
};

export const getStudentAttendance = async (studentId) => {
  const response = await axiosInstance.get(`${ATTENDANCE_API}/student/${studentId}`);
  return response.data;
};

export const getAdminAttendanceSummary = async () => {
  const response = await axiosInstance.get(`${ATTENDANCE_API}/admin/summary`);
  return response.data;
};

export const getAdminStudentAttendance = async (studentId, departmentId) => {
  const response = await axiosInstance.get(`${ATTENDANCE_API}/admin/student/${studentId}`, {
    params: { departmentId },
  });
  return response.data;
};
