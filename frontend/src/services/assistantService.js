import axiosInstance from "./axiosInstance";

const BASE = "/assistant";

/** Subjects the current user assists on (as a subgroup assistant). */
export const getAssistantSubjects = () =>
  axiosInstance.get(`${BASE}/subjects`).then((r) => r.data);

/** Combined roster (across the assistant's subgroups) for one subject. */
export const getAssistantSubjectStudents = (subjectId) =>
  axiosInstance.get(`${BASE}/subjects/${subjectId}/students`).then((r) => r.data);

/** The current assistant's full review log for one student in one subject. */
export const getAssistantStudentReviews = (subjectId, studentId) =>
  axiosInstance
    .get(`${BASE}/subjects/${subjectId}/students/${studentId}/reviews`)
    .then((r) => r.data);

/** Create a dated entry, or upsert the final review when `reviewDate` is null. */
export const createAssistantReview = (subjectId, studentId, payload) =>
  axiosInstance
    .post(`${BASE}/subjects/${subjectId}/students/${studentId}/reviews`, payload)
    .then((r) => r.data);

export const updateAssistantReview = (reviewId, payload) =>
  axiosInstance.put(`${BASE}/reviews/${reviewId}`, payload).then((r) => r.data);

export const deleteAssistantReview = (reviewId) =>
  axiosInstance.delete(`${BASE}/reviews/${reviewId}`);

/** Subject owner's read-only view of a student's assistant reviews. */
export const getAssistantReviewsForStudent = (subjectId, studentId) =>
  axiosInstance
    .get(`/teacher/subjects/${subjectId}/students/${studentId}/assistant-reviews`)
    .then((r) => r.data);
