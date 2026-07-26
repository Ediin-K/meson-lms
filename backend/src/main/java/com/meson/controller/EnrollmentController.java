
package com.meson.controller;

import com.meson.dto.EnrollmentRequest;
import com.meson.dto.EnrollmentResponse;
import com.meson.entity.EnrollmentStatus;
import com.meson.repository.UserRepository;
import com.meson.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentResponse>> getAll() {
        return ResponseEntity.ok(enrollmentService.getAll());
    }

    @GetMapping("/paged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<EnrollmentResponse>> getPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status) {
        return ResponseEntity.ok(enrollmentService.getPage(search, status,
                org.springframework.data.domain.PageRequest.of(page, Math.min(size, 100),
                        org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("@securityAccessService.canAccessStudent(#userId)")
    public ResponseEntity<List<EnrollmentResponse>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentService.getByUserId(userId));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentResponse>> getBySubjectId(@PathVariable Long subjectId) {
        return ResponseEntity.ok(enrollmentService.getBySubjectId(subjectId));
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponse> create(@Valid @RequestBody EnrollmentRequest request) {
        // Only admins may enroll someone else; everyone else can only enroll themselves,
        // regardless of what userId they sent.
        if (!isAdmin()) {
            request.setUserId(currentUserId());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.create(request));
    }

    @PatchMapping("/{id}/progresi")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentResponse> updateProgresi(
            @PathVariable Long id,
            @RequestParam Double progresi) {
        return ResponseEntity.ok(enrollmentService.updateProgresi(id, progresi));
    }

    @PatchMapping("/{id}/statusi")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentResponse> updateStatusi(
            @PathVariable Long id,
            @RequestParam EnrollmentStatus statusi) {
        return ResponseEntity.ok(enrollmentService.updateStatusi(id, statusi));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        enrollmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet"))
                .getId();
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
