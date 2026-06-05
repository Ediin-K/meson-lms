package com.meson.controller;

import com.meson.dto.DirectionGroupRequest;
import com.meson.dto.DirectionGroupResponse;
import com.meson.dto.StudentGroupMemberResponse;
import com.meson.service.DirectionGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class DirectionGroupController {

    private final DirectionGroupService directionGroupService;

    @GetMapping("/api/directions/{directionId}/direction-groups")
    public ResponseEntity<List<DirectionGroupResponse>> getByDirection(
            @PathVariable Long directionId,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(directionGroupService.getByCategory(directionId, semester));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/directions/{directionId}/direction-groups")
    public ResponseEntity<DirectionGroupResponse> create(
            @PathVariable Long directionId,
            @Valid @RequestBody DirectionGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(directionGroupService.create(directionId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/direction-groups/{groupId}")
    public ResponseEntity<DirectionGroupResponse> update(
            @PathVariable Long groupId,
            @Valid @RequestBody DirectionGroupRequest request) {
        return ResponseEntity.ok(directionGroupService.update(groupId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/direction-groups/{groupId}")
    public ResponseEntity<Void> delete(@PathVariable Long groupId) {
        directionGroupService.delete(groupId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/direction-groups/{groupId}/students")
    public ResponseEntity<List<StudentGroupMemberResponse>> getMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(directionGroupService.getMembers(groupId));
    }
}
