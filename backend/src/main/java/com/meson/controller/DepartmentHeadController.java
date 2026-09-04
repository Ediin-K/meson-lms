package com.meson.controller;

import com.meson.dto.AttendanceSummaryResponse;
import com.meson.dto.DepartmentAttendanceStudentRow;
import com.meson.dto.DepartmentHeadDashboardResponse;
import com.meson.dto.EnrollmentResponse;
import com.meson.dto.SubjectResponse;
import com.meson.service.DepartmentHeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/department-head")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DEPARTMENT_HEAD')")
public class DepartmentHeadController {

    private final DepartmentHeadService departmentHeadService;

    @GetMapping("/dashboard")
    public ResponseEntity<DepartmentHeadDashboardResponse> getDashboard() {
        return ResponseEntity.ok(departmentHeadService.getDashboard());
    }

    @GetMapping("/students")
    public ResponseEntity<List<EnrollmentResponse>> getStudents() {
        return ResponseEntity.ok(departmentHeadService.getStudents());
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectResponse>> getSubjects() {
        return ResponseEntity.ok(departmentHeadService.getSubjects());
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<DepartmentAttendanceStudentRow>> getAttendanceSummary(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(departmentHeadService.getAttendanceSummary(subjectId, dateFrom, dateTo));
    }

    @GetMapping("/attendance/{studentId}")
    public ResponseEntity<AttendanceSummaryResponse> getStudentAttendance(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(departmentHeadService.getStudentAttendance(studentId, subjectId, dateFrom, dateTo));
    }
}
