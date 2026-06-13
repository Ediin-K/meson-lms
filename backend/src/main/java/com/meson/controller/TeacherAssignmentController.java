package com.meson.controller;

import com.meson.dto.AssignmentCreateRequest;
import com.meson.dto.AssignmentResponse;
import com.meson.dto.AssignmentSubmissionResponse;
import com.meson.entity.LessonType;
import com.meson.repository.LessonRepository;
import com.meson.repository.UserRepository;
import com.meson.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
@RequiredArgsConstructor
public class TeacherAssignmentController {

    private static final List<String> PREVIEWABLE_PREFIXES = List.of("application/pdf", "image/", "text/");

    private final AssignmentService assignmentService;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;

    // ------------------- assignment CRUD (by assignment id) -------------------

    @PostMapping("/assignments")
    public AssignmentResponse create(@RequestBody AssignmentCreateRequest request) {
        return assignmentService.create(request, currentUserId());
    }

    @PutMapping("/assignments/{id}")
    public AssignmentResponse update(@PathVariable Long id, @RequestBody AssignmentCreateRequest request) {
        return assignmentService.update(id, request, currentUserId());
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.delete(id, currentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments")
    public List<AssignmentResponse> getAll() {
        return assignmentService.getTeacherAssignments(currentUserId());
    }

    /** Lessons of type ASSIGNMENT owned by the teacher, for the create-assignment dialog. */
    @GetMapping("/assignments/lessons")
    public List<Map<String, Object>> getAssignmentLessons() {
        return lessonRepository.findByModuleSubjectTeacherId(currentUserId()).stream()
                .filter(l -> l.getLloji() == LessonType.ASSIGNMENT)
                .map(l -> Map.<String, Object>of(
                        "id", l.getId(),
                        "title", l.getTitulli(),
                        "moduleTitle", l.getModule().getTitulli(),
                        "subjectTitle", l.getModule().getSubject().getTitulli()))
                .toList();
    }

    @PostMapping("/assignments/{id}/attachment")
    public AssignmentResponse uploadAttachmentByAssignment(@PathVariable Long id,
                                                           @RequestParam("file") MultipartFile file) {
        return assignmentService.uploadAttachmentByAssignment(id, file, currentUserId());
    }

    @DeleteMapping("/assignments/{id}/attachment")
    public AssignmentResponse removeAttachmentByAssignment(@PathVariable Long id) {
        return assignmentService.removeAttachmentByAssignment(id, currentUserId());
    }

    @GetMapping("/assignments/{id}/submissions")
    public List<AssignmentSubmissionResponse> getSubmissionsByAssignment(@PathVariable Long id) {
        return assignmentService.getSubmissionsByAssignment(id, currentUserId());
    }

    /** Downloads every submitted file for the assignment as one ZIP archive. */
    @GetMapping("/assignments/{id}/submissions/zip")
    public ResponseEntity<org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody>
            zipSubmissions(@PathVariable Long id) {
        Long teacherId = currentUserId();
        org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody body =
                out -> assignmentService.writeSubmissionsZip(id, teacherId, out);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"submissions-" + id + ".zip\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(body);
    }

    /** Applies one grade/feedback to multiple submissions at once. */
    @PutMapping("/submissions/bulk-grade")
    public List<AssignmentSubmissionResponse> bulkGrade(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Number> rawIds = (List<Number>) body.get("submissionIds");
        List<Long> ids = rawIds == null ? List.of() : rawIds.stream().map(Number::longValue).toList();
        Object rawGrade = body.get("grade");
        Double grade = rawGrade == null ? null : Double.valueOf(rawGrade.toString());
        String feedback = body.get("feedback") != null ? body.get("feedback").toString() : null;
        return assignmentService.bulkGrade(ids, grade, feedback, currentUserId());
    }

    // ------------------- legacy lesson-based endpoints -------------------

    @PostMapping("/lessons/{lessonId}/assignment")
    public AssignmentResponse upsert(@PathVariable Long lessonId,
                                     @RequestBody Map<String, String> body) {
        Instant deadline = parseDeadline(body.get("deadline"));
        return assignmentService.upsertForLesson(lessonId, deadline, currentUserId());
    }

    @DeleteMapping("/lessons/{lessonId}/assignment")
    public ResponseEntity<Void> delete(@PathVariable Long lessonId) {
        assignmentService.deleteForLesson(lessonId, currentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lessons/{lessonId}/assignment/attachment")
    public AssignmentResponse uploadAttachment(@PathVariable Long lessonId,
                                               @RequestParam("file") MultipartFile file) {
        return assignmentService.uploadAttachment(lessonId, file, currentUserId());
    }

    @DeleteMapping("/lessons/{lessonId}/assignment/attachment")
    public AssignmentResponse removeAttachment(@PathVariable Long lessonId) {
        return assignmentService.removeAttachment(lessonId, currentUserId());
    }

    @GetMapping("/lessons/{lessonId}/assignment/submissions")
    public List<AssignmentSubmissionResponse> getSubmissions(@PathVariable Long lessonId) {
        return assignmentService.getSubmissionsByLesson(lessonId, currentUserId());
    }

    // ------------------- submission files & grading -------------------

    @GetMapping("/submissions/{subId}/file")
    public ResponseEntity<Resource> downloadSubmission(@PathVariable Long subId) {
        Resource resource = assignmentService.serveSubmissionFile(subId, currentUserId());
        String filename = assignmentService.getSubmissionFileName(subId, currentUserId());
        if (filename == null) filename = "submission";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    /** Serves the file inline (PDF/image/text) so the browser can render it. */
    @GetMapping("/submissions/{subId}/preview")
    public ResponseEntity<Resource> previewSubmission(@PathVariable Long subId) {
        Resource resource = assignmentService.serveSubmissionFile(subId, currentUserId());
        String filename = assignmentService.getSubmissionFileName(subId, currentUserId());
        if (filename == null) filename = "submission";

        MediaType mediaType = MediaTypeFactory.getMediaType(filename)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);
        boolean previewable = PREVIEWABLE_PREFIXES.stream()
                .anyMatch(mediaType.toString()::startsWith);
        String disposition = (previewable ? "inline" : "attachment") + "; filename=\"" + filename + "\"";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentType(previewable ? mediaType : MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @PutMapping("/submissions/{subId}/grade")
    public AssignmentSubmissionResponse grade(@PathVariable Long subId,
                                              @RequestBody Map<String, Object> body) {
        Object rawGrade = body.get("grade");
        Double grade = rawGrade == null ? null : Double.valueOf(rawGrade.toString());
        String feedback = body.get("feedback") != null ? body.get("feedback").toString() : null;
        return assignmentService.gradeSubmission(subId, grade, feedback, currentUserId());
    }

    private Instant parseDeadline(String raw) {
        if (raw == null) throw new RuntimeException("Afati është i detyrueshëm");
        try {
            return Instant.parse(raw);
        } catch (Exception e) {
            // datetime-local value without offset: interpret as system default zone
            return java.time.LocalDateTime.parse(raw)
                    .atZone(java.time.ZoneId.systemDefault()).toInstant();
        }
    }

    private Long currentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet"))
                .getId();
    }
}
