package com.meson.controller;

import com.meson.dto.SubjectProgressResponse;
import com.meson.dto.LessonViewResponse;
import com.meson.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping("/lessons/{lessonId}/view")
    public ResponseEntity<LessonViewResponse> markLessonViewed(@PathVariable Long lessonId) {
        return ResponseEntity.ok(progressService.markLessonViewed(lessonId));
    }

    @GetMapping("/subjects/{subjectId}")
    public ResponseEntity<SubjectProgressResponse> getSubjectProgress(@PathVariable Long subjectId) {
        return ResponseEntity.ok(progressService.getSubjectProgress(subjectId));
    }
}
