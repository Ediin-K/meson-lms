package com.meson.controller;

import com.meson.dto.*;
import com.meson.service.SmisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/smis")
@RequiredArgsConstructor
public class SmisController {

    private final SmisService smisService;

    @GetMapping("/courses/available")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<SmisCourseResponse>> availableCourses() {
        return ResponseEntity.ok(smisService.getAvailableCourses());
    }

    @PostMapping("/students/{studentId}/exam-applications")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ExamApplicationResponse> registerExam(
            @PathVariable Long studentId,
            @Valid @RequestBody ExamApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(smisService.registerExam(studentId, request));
    }

    @GetMapping("/students/{studentId}/exam-applications")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<ExamApplicationResponse>> studentApplications(@PathVariable Long studentId) {
        return ResponseEntity.ok(smisService.getStudentApplications(studentId));
    }

    @PatchMapping("/students/{studentId}/exam-applications/{applicationId}/cancel")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ExamApplicationResponse> cancelApplication(
            @PathVariable Long studentId,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(smisService.cancelApplication(studentId, applicationId));
    }

    @PatchMapping("/students/{studentId}/exam-applications/{applicationId}/refuse-grade")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ExamApplicationResponse> refuseGrade(
            @PathVariable Long studentId,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(smisService.refuseGrade(studentId, applicationId));
    }

    @GetMapping("/professor/exam-applications")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<ExamApplicationResponse>> professorApplications() {
        return ResponseEntity.ok(smisService.getProfessorApplications());
    }

    @PatchMapping("/professor/exam-applications/{applicationId}/grade")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ExamApplicationResponse> submitGrade(
            @PathVariable Long applicationId,
            @Valid @RequestBody ExamGradeRequest request) {
        return ResponseEntity.ok(smisService.submitGrade(applicationId, request));
    }

    @DeleteMapping("/professor/exam-applications/{applicationId}/grade")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ExamApplicationResponse> deleteGrade(@PathVariable Long applicationId) {
        return ResponseEntity.ok(smisService.deleteGrade(applicationId));
    }

    @GetMapping("/admin/exam-applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExamApplicationResponse>> adminApplications(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(smisService.getAdminApplications(status));
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SmisAdminSummaryResponse> adminSummary() {
        return ResponseEntity.ok(smisService.getAdminSummary());
    }
}
