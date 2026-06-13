import axiosInstance from './axiosInstance';

const progressService = {
  markViewed:        (lessonId)  => axiosInstance.post(`/progress/lessons/${lessonId}/view`),
  getSubjectProgress: (subjectId)  => axiosInstance.get(`/progress/subjects/${subjectId}`),
  getStudentProgress:(subjectId, studentId) =>
    axiosInstance.get(`/teacher/subjects/${subjectId}/students/${studentId}/progress`),
  getSubjectStudents: (subjectId)  => axiosInstance.get(`/teacher/subjects/${subjectId}/students`),
};

export default progressService;
