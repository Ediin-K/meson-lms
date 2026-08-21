package com.meson.controller;

import com.meson.dto.DepartmentHeadDashboardResponse;
import com.meson.dto.EnrollmentResponse;
import com.meson.service.DepartmentHeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
}
