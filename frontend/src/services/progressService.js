import axiosInstance from './axiosInstance';

const progressService = {
  markViewed:        (lessonId)  => axiosInstance.post(`/progress/lessons/${lessonId}/view`),
  getCourseProgress: (courseId)  => axiosInstance.get(`/progress/courses/${courseId}`),
  getStudentProgress:(courseId, studentId) =>
    axiosInstance.get(`/teacher/courses/${courseId}/students/${studentId}/progress`),
  getCourseStudents: (courseId)  => axiosInstance.get(`/teacher/courses/${courseId}/students`),
};

export default progressService;
