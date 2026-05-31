package com.meson.controller;

import com.meson.dto.CourseProgressResponse;
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

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<EnrollmentResponse>> getStudentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(teacherStudentService.getStudentsByCourse(courseId));
    }

    @GetMapping("/courses/{courseId}/students/{studentId}/progress")
    public ResponseEntity<CourseProgressResponse> getStudentProgress(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(progressService.getStudentCourseProgress(courseId, studentId));
    }
}
