package com.meson.controller;

import com.meson.dto.GradeAuditLogResponse;
import com.meson.dto.GradeRequest;
import com.meson.dto.GradeResponse;
import com.meson.dto.StudentGradesSummaryResponse;
import com.meson.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @GetMapping("/student/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or @securityAccessService.canAccessStudent(#id)")
    public ResponseEntity<StudentGradesSummaryResponse> getByStudentId(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.getByStudentId(id));
    }

    @GetMapping("/subject/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<GradeResponse>> getBySubjectId(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.getBySubjectId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<GradeResponse> create(@Valid @RequestBody GradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<GradeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        gradeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<GradeAuditLogResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.getHistoryForGrade(id));
    }

    @GetMapping("/audit-log")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Page<GradeAuditLogResponse>> getAuditLog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(gradeService.getAuditLog(
                PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "performedAt"))));
    }
}
