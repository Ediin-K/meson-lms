package com.meson.controller;

import com.meson.dto.DepartmentGroupRequest;
import com.meson.dto.DepartmentGroupResponse;
import com.meson.dto.StudentGroupMemberResponse;
import com.meson.service.DepartmentGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class DepartmentGroupController {

    private final DepartmentGroupService departmentGroupService;

    @GetMapping("/api/departments/{departmentId}/department-groups")
    public ResponseEntity<List<DepartmentGroupResponse>> getByDepartment(
            @PathVariable Long departmentId,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(departmentGroupService.getByDepartment(departmentId, semester));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/departments/{departmentId}/department-groups")
    public ResponseEntity<DepartmentGroupResponse> create(
            @PathVariable Long departmentId,
            @Valid @RequestBody DepartmentGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentGroupService.create(departmentId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/department-groups/{groupId}")
    public ResponseEntity<DepartmentGroupResponse> update(
            @PathVariable Long groupId,
            @Valid @RequestBody DepartmentGroupRequest request) {
        return ResponseEntity.ok(departmentGroupService.update(groupId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/department-groups/{groupId}")
    public ResponseEntity<Void> delete(@PathVariable Long groupId) {
        departmentGroupService.delete(groupId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/department-groups/{groupId}/students")
    public ResponseEntity<List<StudentGroupMemberResponse>> getMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(departmentGroupService.getMembers(groupId));
    }
}
