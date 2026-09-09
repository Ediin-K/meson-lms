package com.meson.controller;

import com.meson.dto.AssistantReviewRequest;
import com.meson.dto.AssistantReviewResponse;
import com.meson.dto.AssistantRosterEntryResponse;
import com.meson.dto.AssistantSubjectResponse;
import com.meson.service.AssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Teaching-assistant portal. An assistant is a TEACHER account assigned to one or
 * more subject subgroups (via {@code subject_subgroup_teachers}); these endpoints
 * are scoped to the subjects they assist on.
 */
@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class AssistantController {

    private final AssistantService assistantService;

    @GetMapping("/subjects")
    public ResponseEntity<List<AssistantSubjectResponse>> getSubjects() {
        return ResponseEntity.ok(assistantService.getSubjects());
    }

    @GetMapping("/subjects/{subjectId}/students")
    public ResponseEntity<List<AssistantRosterEntryResponse>> getSubjectStudents(@PathVariable Long subjectId) {
        return ResponseEntity.ok(assistantService.getSubjectStudents(subjectId));
    }

    @GetMapping("/subjects/{subjectId}/students/{studentId}/reviews")
    public ResponseEntity<List<AssistantReviewResponse>> getStudentReviews(
            @PathVariable Long subjectId, @PathVariable Long studentId) {
        return ResponseEntity.ok(assistantService.getStudentReviews(subjectId, studentId));
    }

    @PostMapping("/subjects/{subjectId}/students/{studentId}/reviews")
    public ResponseEntity<AssistantReviewResponse> createReview(
            @PathVariable Long subjectId, @PathVariable Long studentId,
            @Valid @RequestBody AssistantReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assistantService.saveReview(subjectId, studentId, request));
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<AssistantReviewResponse> updateReview(
            @PathVariable Long reviewId, @Valid @RequestBody AssistantReviewRequest request) {
        return ResponseEntity.ok(assistantService.updateReview(reviewId, request));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        assistantService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
