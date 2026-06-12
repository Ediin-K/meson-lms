import axiosInstance from './axiosInstance'

const assignmentService = {
    
    getByLesson:     (lessonId) => axiosInstance.get(`/assignments/lesson/${lessonId}`),
    getById:         (id)       => axiosInstance.get(`/assignments/${id}`),
    getMySubmission: (id)       => axiosInstance.get(`/assignments/${id}/my-submission`),
    getMySubmissions:()         => axiosInstance.get('/assignments/my-submissions'),
    getMyOverview:   ()         => axiosInstance.get('/assignments/my-overview'),

    submit: (id, file) => {
        const form = new FormData()
        form.append('file', file)
        return axiosInstance.post(`/assignments/${id}/submit`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    downloadAttachment: (id) =>
        axiosInstance.get(`/assignments/${id}/attachment`, { responseType: 'blob' }),

    // deadline is a local datetime-local string; send as UTC ISO instant
    upsertForLesson: (lessonId, deadline) =>
        axiosInstance.post(`/teacher/lessons/${lessonId}/assignment`, {
            deadline: new Date(deadline).toISOString(),
        }),

    deleteForLesson: (lessonId) =>
        axiosInstance.delete(`/teacher/lessons/${lessonId}/assignment`),

    uploadAttachment: (lessonId, file) => {
        const form = new FormData()
        form.append('file', file)
        return axiosInstance.post(`/teacher/lessons/${lessonId}/assignment/attachment`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    removeAttachment: (lessonId) =>
        axiosInstance.delete(`/teacher/lessons/${lessonId}/assignment/attachment`),

    getSubmissions: (lessonId) =>
        axiosInstance.get(`/teacher/lessons/${lessonId}/assignment/submissions`),

    downloadSubmissionFile: (subId) =>
        axiosInstance.get(`/teacher/submissions/${subId}/file`, { responseType: 'blob' }),

    previewSubmissionFile: (subId) =>
        axiosInstance.get(`/teacher/submissions/${subId}/preview`, { responseType: 'blob' }),

    gradeSubmission: (subId, grade, feedback) =>
        axiosInstance.put(`/teacher/submissions/${subId}/grade`, { grade, feedback }),

    getAll: () => axiosInstance.get('/teacher/assignments'),

    // assignment-id based teacher endpoints (TeacherAssignments page)
    getLessonsForAssignment: () => axiosInstance.get('/teacher/assignments/lessons'),

    create: (payload) =>
        axiosInstance.post('/teacher/assignments', {
            ...payload, deadline: new Date(payload.deadline).toISOString(),
        }),

    update: (id, payload) =>
        axiosInstance.put(`/teacher/assignments/${id}`, {
            ...payload, deadline: new Date(payload.deadline).toISOString(),
        }),

    remove: (id) => axiosInstance.delete(`/teacher/assignments/${id}`),

    uploadAttachmentById: (assignmentId, file) => {
        const form = new FormData()
        form.append('file', file)
        return axiosInstance.post(`/teacher/assignments/${assignmentId}/attachment`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    removeAttachmentById: (assignmentId) =>
        axiosInstance.delete(`/teacher/assignments/${assignmentId}/attachment`),

    getSubmissionsByAssignment: (assignmentId) =>
        axiosInstance.get(`/teacher/assignments/${assignmentId}/submissions`),

    downloadSubmissionsZip: (assignmentId) =>
        axiosInstance.get(`/teacher/assignments/${assignmentId}/submissions/zip`, { responseType: 'blob' }),

    bulkGrade: (submissionIds, grade, feedback) =>
        axiosInstance.put('/teacher/submissions/bulk-grade', { submissionIds, grade, feedback }),
}

export default assignmentService
