package com.meson.controller;

import com.meson.dto.AcademicTermRequest;
import com.meson.dto.AcademicTermResponse;
import com.meson.service.AcademicTermService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-terms")
@RequiredArgsConstructor
public class AcademicTermController {

    private final AcademicTermService academicTermService;

    @GetMapping
    public ResponseEntity<List<AcademicTermResponse>> getAll() {
        return ResponseEntity.ok(academicTermService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicTermResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(academicTermService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicTermResponse> create(@Valid @RequestBody AcademicTermRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(academicTermService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicTermResponse> update(@PathVariable Long id,
                                                         @Valid @RequestBody AcademicTermRequest request) {
        return ResponseEntity.ok(academicTermService.update(id, request));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicTermResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(academicTermService.activate(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        academicTermService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
