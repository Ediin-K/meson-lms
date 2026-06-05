package com.meson.controller;

import com.meson.dto.SubjectProgressResponse;
import com.meson.dto.EnrollmentResponse;
import com.meson.service.ProgressService;
import com.meson.service.TeacherStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherStudentController {

    private final TeacherStudentService teacherStudentService;
    private final ProgressService progressService;

    @GetMapping("/students")
    public ResponseEntity<List<EnrollmentResponse>> getStudentsByTeacher() {
        return ResponseEntity.ok(teacherStudentService.getStudentsByTeacher());
    }

    @GetMapping("/subjects/{subjectId}/students")
    public ResponseEntity<List<EnrollmentResponse>> getStudentsBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(teacherStudentService.getStudentsBySubject(subjectId));
    }

    @GetMapping("/subjects/{subjectId}/students/{studentId}/progress")
    public ResponseEntity<SubjectProgressResponse> getStudentProgress(
            @PathVariable Long subjectId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(progressService.getStudentSubjectProgress(subjectId, studentId));
    }
}
