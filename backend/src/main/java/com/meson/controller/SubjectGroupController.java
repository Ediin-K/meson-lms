package com.meson.controller;

import com.meson.dto.SubjectGroupRequest;
import com.meson.dto.SubjectGroupResponse;
import com.meson.dto.SubjectSubgroupRequest;
import com.meson.dto.SubjectSubgroupResponse;
import com.meson.service.SubjectGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubjectGroupController {

    private final SubjectGroupService subjectGroupService;

    @GetMapping("/api/subjects/{subjectId}/groups")
    public ResponseEntity<List<SubjectGroupResponse>> getSubjectGroups(@PathVariable Long subjectId) {
        return ResponseEntity.ok(subjectGroupService.getBySubject(subjectId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/subjects/{subjectId}/groups")
    public ResponseEntity<SubjectGroupResponse> createGroup(
            @PathVariable Long subjectId,
            @Valid @RequestBody SubjectGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subjectGroupService.createGroup(subjectId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/subject-groups/{groupId}")
    public ResponseEntity<SubjectGroupResponse> updateGroup(
            @PathVariable Long groupId,
            @Valid @RequestBody SubjectGroupRequest request) {
        return ResponseEntity.ok(subjectGroupService.updateGroup(groupId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/subject-groups/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId) {
        subjectGroupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/subject-groups/{groupId}/subgroups")
    public ResponseEntity<SubjectSubgroupResponse> createSubgroup(
            @PathVariable Long groupId,
            @Valid @RequestBody SubjectSubgroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subjectGroupService.createSubgroup(groupId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/subject-subgroups/{subgroupId}")
    public ResponseEntity<SubjectSubgroupResponse> updateSubgroup(
            @PathVariable Long subgroupId,
            @Valid @RequestBody SubjectSubgroupRequest request) {
        return ResponseEntity.ok(subjectGroupService.updateSubgroup(subgroupId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/subject-subgroups/{subgroupId}")
    public ResponseEntity<Void> deleteSubgroup(@PathVariable Long subgroupId) {
        subjectGroupService.deleteSubgroup(subgroupId);
        return ResponseEntity.noContent().build();
    }
}
