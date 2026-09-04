package com.meson.controller;

import com.meson.dto.AdminAttendanceStudentRow;
import com.meson.dto.AttendanceMarkRequest;
import com.meson.dto.AttendanceRosterEntryResponse;
import com.meson.dto.AttendanceSummaryResponse;
import com.meson.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/sessions/{scheduleSessionId}/roster")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<AttendanceRosterEntryResponse>> getRoster(
            @PathVariable Long scheduleSessionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getRoster(scheduleSessionId, date));
    }

    @PostMapping("/sessions/{scheduleSessionId}/mark")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Void> markAttendance(
            @PathVariable Long scheduleSessionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody List<AttendanceMarkRequest> marks) {
        attendanceService.markAttendance(scheduleSessionId, date, marks);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or @securityAccessService.canAccessStudent(#studentId)")
    public ResponseEntity<AttendanceSummaryResponse> getForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getForStudent(studentId));
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminAttendanceStudentRow>> getAdminSummary(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(attendanceService.getAdminAttendanceSummary(departmentId, subjectId, dateFrom, dateTo));
    }

    @GetMapping("/admin/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AttendanceSummaryResponse> getAdminStudentAttendance(
            @PathVariable Long studentId,
            @RequestParam Long departmentId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(attendanceService.getAdminStudentAttendance(studentId, departmentId, subjectId, dateFrom, dateTo));
    }
}
