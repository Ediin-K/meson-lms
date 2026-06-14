package com.meson.controller;

import com.meson.dto.StudentGroupRequestResponse;
import com.meson.entity.GroupRequestStatus;
import com.meson.service.StudentGroupRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.meson.entity.User;
import com.meson.repository.UserRepository;
import java.util.List;

@RestController
@RequestMapping("/api/admin/group-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminGroupRequestController {

    private final StudentGroupRequestService studentGroupRequestService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<StudentGroupRequestResponse>> list(
            @RequestParam(required = false) GroupRequestStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long departmentGroupId) {
        return ResponseEntity.ok(studentGroupRequestService.getAdminRequests(status, departmentId, departmentGroupId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<StudentGroupRequestResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(studentGroupRequestService.approve(id, getCurrentUserId()));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<StudentGroupRequestResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(studentGroupRequestService.reject(id, getCurrentUserId()));
    }

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet"));
        return user.getId();
    }
}
