package com.meson.controller;

import com.meson.dto.*;
import com.meson.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    // ASSIGNMENT
    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getAll() {
        return ResponseEntity.ok(assignmentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getById(id));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<AssignmentResponse>> getByLessonId(@PathVariable Long lessonId) {
        return ResponseEntity.ok(assignmentService.getByLessonId(lessonId));
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> create(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // SUBMISSION
    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmissionResponse>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.getSubmissionsByAssignmentId(assignmentId));
    }

    @GetMapping("/submissions/student/{studentId}")
    public ResponseEntity<List<AssignmentSubmissionResponse>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(assignmentService.getSubmissionsByStudentId(studentId));
    }

    @PostMapping("/submissions")
    public ResponseEntity<AssignmentSubmissionResponse> createSubmission(
            @Valid @RequestBody AssignmentSubmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.createSubmission(request));
    }

    @PatchMapping("/submissions/{id}/nota")
    public ResponseEntity<AssignmentSubmissionResponse> gradeSubmission(
            @PathVariable Long id,
            @RequestParam Double nota) {
        return ResponseEntity.ok(assignmentService.gradeSubmission(id, nota));
    }

    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        assignmentService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }
}