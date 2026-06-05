package com.meson.controller;

import com.meson.dto.SubjectRequest;
import com.meson.dto.SubjectResponse;
import com.meson.dto.TeacherStatsDTO;
import com.meson.service.TeacherSubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherSubjectController {

    private final TeacherSubjectService teacherSubjectService;

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectResponse>> getOwnSubjects() {
        return ResponseEntity.ok(teacherSubjectService.getOwnSubjects());
    }

    @GetMapping("/subjects/{id}")
    public ResponseEntity<SubjectResponse> getOwnSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherSubjectService.getOwnSubjectById(id));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<SubjectResponse> updateSubjectBasicInfo(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(teacherSubjectService.updateSubjectBasicInfo(id, request));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<TeacherStatsDTO> getStats() {
        return ResponseEntity.ok(teacherSubjectService.getStats());
    }
}
