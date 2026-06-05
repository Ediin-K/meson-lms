package com.meson.controller;

import com.meson.dto.CreateDepartmentGroupWizardRequest;
import com.meson.dto.DepartmentGroupWizardContextResponse;
import com.meson.dto.DepartmentGroupWizardResponse;
import com.meson.service.DepartmentGroupWizardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/department-groups")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DepartmentGroupWizardController {

    private final DepartmentGroupWizardService wizardService;

    @GetMapping("/wizard/context")
    public ResponseEntity<DepartmentGroupWizardContextResponse> getContext(
            @RequestParam Long departmentId,
            @RequestParam Integer semester) {
        return ResponseEntity.ok(wizardService.getContext(departmentId, semester));
    }

    @PostMapping("/wizard")
    public ResponseEntity<DepartmentGroupWizardResponse> create(
            @Valid @RequestBody CreateDepartmentGroupWizardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wizardService.createGroupWithSchedule(request));
    }

    @GetMapping("/{departmentGroupId}/detail")
    public ResponseEntity<DepartmentGroupWizardResponse> getDetail(@PathVariable Long departmentGroupId) {
        return ResponseEntity.ok(wizardService.getGroupDetail(departmentGroupId));
    }
}
