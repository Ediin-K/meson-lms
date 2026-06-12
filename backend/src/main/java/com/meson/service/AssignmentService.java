package com.meson.service;

import com.meson.dto.AssignmentCreateRequest;
import com.meson.dto.AssignmentResponse;
import com.meson.dto.AssignmentSubmissionResponse;
import com.meson.entity.Assignment;
import com.meson.entity.AssignmentSubmission;
import com.meson.entity.Enrollment;
import com.meson.entity.EnrollmentStatus;
import com.meson.entity.Lesson;
import com.meson.entity.User;
import com.meson.repository.AssignmentRepository;
import com.meson.repository.AssignmentSubmissionRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.LessonRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "md", "csv",
            "zip", "rar", "7z", "png", "jpg", "jpeg", "gif",
            "java", "py", "js", "ts", "c", "cpp", "h", "html", "css", "json", "sql"
    );

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStorageService fileStorageService;

    @Value("${app.upload.assignment.max-size-mb:20}")
    private long maxFileSizeMb;

    public Optional<AssignmentResponse> getByLesson(Long lessonId) {
        return assignmentRepository.findByLessonId(lessonId)
                .map(this::toResponse);
    }

    public AssignmentResponse getById(Long id) {
        return toResponse(findAssignment(id));
    }

    // ------------------------------------------------------------------
    // Teacher: assignment CRUD
    // ------------------------------------------------------------------

    public AssignmentResponse create(AssignmentCreateRequest request, Long teacherId) {
        if (request.getLessonId() == null) throw new RuntimeException("Leksioni është i detyrueshëm");
        Lesson lesson = lessonRepository.findByIdAndModuleSubjectTeacherId(request.getLessonId(), teacherId)
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet ose nuk keni akses"));
        if (assignmentRepository.findByLessonId(lesson.getId()).isPresent())
            throw new RuntimeException("Ky leksion ka tashmë një detyrë");
        validateAssignmentFields(request);

        Assignment assignment = Assignment.builder()
                .lesson(lesson)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .build();
        return toResponse(assignmentRepository.save(assignment));
    }

    public AssignmentResponse update(Long assignmentId, AssignmentCreateRequest request, Long teacherId) {
        Assignment assignment = findTeacherAssignment(assignmentId, teacherId);
        validateAssignmentFields(request);
        assignment.setTitle(request.getTitle().trim());
        assignment.setDescription(request.getDescription());
        assignment.setDeadline(request.getDeadline());
        return toResponse(assignmentRepository.save(assignment));
    }

    public void delete(Long assignmentId, Long teacherId) {
        Assignment assignment = findTeacherAssignment(assignmentId, teacherId);
        cleanupFiles(assignment);
        submissionRepository.findByAssignmentId(assignment.getId()).forEach(this::deleteSubmissionFile);
        assignmentRepository.delete(assignment);
    }

    private void validateAssignmentFields(AssignmentCreateRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank())
            throw new RuntimeException("Titulli është i detyrueshëm");
        if (request.getDeadline() == null)
            throw new RuntimeException("Afati është i detyrueshëm");
    }

    public AssignmentResponse upsertForLesson(Long lessonId, Instant deadline, Long teacherId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));
        verifyTeacherOwnsLesson(lesson, teacherId);

        Assignment assignment = assignmentRepository.findByLessonId(lessonId)
                .orElse(Assignment.builder().lesson(lesson).build());

        if (assignment.getTitle() == null) assignment.setTitle(lesson.getTitulli());
        if (assignment.getDescription() == null) assignment.setDescription(lesson.getPermbajtja());
        assignment.setDeadline(deadline);
        return toResponse(assignmentRepository.save(assignment));
    }

    public void deleteForLesson(Long lessonId, Long teacherId) {
        assignmentRepository.findByLessonId(lessonId).ifPresent(a -> {
            verifyTeacherOwnsLesson(a.getLesson(), teacherId);
            cleanupFiles(a);
            submissionRepository.findByAssignmentId(a.getId())
                    .forEach(this::deleteSubmissionFile);
            assignmentRepository.delete(a);
        });
    }

    public List<AssignmentResponse> getTeacherAssignments(Long teacherId) {
        return assignmentRepository.findByLessonModuleSubjectTeacherId(teacherId)
                .stream().map(this::toResponse).toList();
    }

    // ------------------------------------------------------------------
    // Teacher: attachments
    // ------------------------------------------------------------------

    public AssignmentResponse uploadAttachment(Long lessonId, MultipartFile file, Long teacherId) {
        Assignment assignment = findTeacherAssignmentByLesson(lessonId, teacherId);
        return storeAttachment(assignment, file);
    }

    public AssignmentResponse uploadAttachmentByAssignment(Long assignmentId, MultipartFile file, Long teacherId) {
        Assignment assignment = findTeacherAssignment(assignmentId, teacherId);
        return storeAttachment(assignment, file);
    }

    private AssignmentResponse storeAttachment(Assignment assignment, MultipartFile file) {
        validateFile(file);
        cleanupFiles(assignment);
        String path = fileStorageService.store(file, "assignments/attachments");
        assignment.setAttachmentPath(path);
        assignment.setAttachmentName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment");
        return toResponse(assignmentRepository.save(assignment));
    }

    public AssignmentResponse removeAttachment(Long lessonId, Long teacherId) {
        return clearAttachment(findTeacherAssignmentByLesson(lessonId, teacherId));
    }

    public AssignmentResponse removeAttachmentByAssignment(Long assignmentId, Long teacherId) {
        return clearAttachment(findTeacherAssignment(assignmentId, teacherId));
    }

    private AssignmentResponse clearAttachment(Assignment assignment) {
        cleanupFiles(assignment);
        assignment.setAttachmentPath(null);
        assignment.setAttachmentName(null);
        return toResponse(assignmentRepository.save(assignment));
    }

    // ------------------------------------------------------------------
    // Teacher: submissions, grading, files
    // ------------------------------------------------------------------

    public List<AssignmentSubmissionResponse> getSubmissionsByLesson(Long lessonId, Long teacherId) {
        Assignment assignment = findTeacherAssignmentByLesson(lessonId, teacherId);
        return buildSubmissionRows(assignment);
    }

    public List<AssignmentSubmissionResponse> getSubmissionsByAssignment(Long assignmentId, Long teacherId) {
        Assignment assignment = findTeacherAssignment(assignmentId, teacherId);
        return buildSubmissionRows(assignment);
    }

    /** All submissions plus a NOT_SUBMITTED row for every actively enrolled student without one. */
    private List<AssignmentSubmissionResponse> buildSubmissionRows(Assignment assignment) {
        List<AssignmentSubmission> subs = submissionRepository.findByAssignmentId(assignment.getId());
        List<AssignmentSubmissionResponse> rows = new ArrayList<>(subs.stream().map(this::toSubmissionResponse).toList());

        Set<Long> submittedStudentIds = new java.util.HashSet<>();
        subs.forEach(s -> submittedStudentIds.add(s.getStudent().getId()));

        Long subjectId = assignment.getLesson().getModule().getSubject().getId();
        for (Enrollment e : enrollmentRepository.findBySubjectId(subjectId)) {
            if (e.getStatusi() != EnrollmentStatus.AKTIV) continue;
            User student = e.getUser();
            if (submittedStudentIds.contains(student.getId())) continue;
            rows.add(AssignmentSubmissionResponse.builder()
                    .assignmentId(assignment.getId())
                    .assignmentTitle(assignment.getTitle())
                    .deadline(assignment.getDeadline())
                    .lessonId(assignment.getLesson().getId())
                    .lessonTitle(assignment.getLesson().getTitulli())
                    .studentId(student.getId())
                    .studentName(student.getEmri() + " " + student.getMbiemri())
                    .studentEmail(student.getEmail())
                    .status("NOT_SUBMITTED")
                    .build());
        }
        return rows;
    }

    /** Streams all submitted files for an assignment as a ZIP archive. */
    public void writeSubmissionsZip(Long assignmentId, Long teacherId, java.io.OutputStream out) {
        Assignment assignment = findTeacherAssignment(assignmentId, teacherId);
        List<AssignmentSubmission> subs = submissionRepository.findByAssignmentId(assignment.getId());
        try (java.util.zip.ZipOutputStream zip = new java.util.zip.ZipOutputStream(out)) {
            Set<String> usedNames = new java.util.HashSet<>();
            for (AssignmentSubmission sub : subs) {
                String student = (sub.getStudent().getEmri() + "_" + sub.getStudent().getMbiemri())
                        .replaceAll("[^\\p{L}\\p{N}_-]", "_");
                String entryName = student + "/" + sub.getFileName();
                // Avoid duplicate entry names crashing the stream
                if (!usedNames.add(entryName)) entryName = student + "/" + sub.getId() + "_" + sub.getFileName();
                try {
                    Resource resource = fileStorageService.loadAsResource(sub.getFilePath());
                    zip.putNextEntry(new java.util.zip.ZipEntry(entryName));
                    try (java.io.InputStream in = resource.getInputStream()) {
                        in.transferTo(zip);
                    }
                    zip.closeEntry();
                } catch (Exception ignored) {
                    // A missing file on disk shouldn't break the whole archive
                }
            }
        } catch (java.io.IOException e) {
            throw new RuntimeException("Krijimi i arkivit ZIP dështoi: " + e.getMessage());
        }
    }

    /** Applies the same grade/feedback to several submissions of one teacher. */
    @Transactional
    public List<AssignmentSubmissionResponse> bulkGrade(List<Long> submissionIds, Double grade,
                                                        String feedback, Long teacherId) {
        if (submissionIds == null || submissionIds.isEmpty())
            throw new RuntimeException("Zgjidhni të paktën një dorëzim");
        return submissionIds.stream()
                .map(id -> gradeSubmission(id, grade, feedback, teacherId))
                .toList();
    }

    @Transactional
    public AssignmentSubmissionResponse gradeSubmission(Long submissionId, Double grade, String feedback, Long teacherId) {
        AssignmentSubmission sub = findSubmissionForTeacher(submissionId, teacherId);
        if (grade == null && (feedback == null || feedback.isBlank()))
            throw new RuntimeException("Jepni një notë ose një koment");
        if (grade != null && (grade < 0 || grade > 100))
            throw new RuntimeException("Nota duhet të jetë midis 0 dhe 100");
        sub.setGrade(grade);
        sub.setFeedback(feedback);
        sub.setGradedAt(Instant.now());
        return toSubmissionResponse(submissionRepository.save(sub));
    }

    public Resource serveSubmissionFile(Long submissionId, Long teacherId) {
        AssignmentSubmission sub = findSubmissionForTeacher(submissionId, teacherId);
        return fileStorageService.loadAsResource(sub.getFilePath());
    }

    public String getSubmissionFileName(Long submissionId, Long teacherId) {
        return findSubmissionForTeacher(submissionId, teacherId).getFileName();
    }

    private AssignmentSubmission findSubmissionForTeacher(Long submissionId, Long teacherId) {
        AssignmentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Dorëzimi nuk u gjet"));
        findTeacherAssignment(sub.getAssignment().getId(), teacherId);
        return sub;
    }

    public Resource serveAttachment(Long assignmentId) {
        Assignment assignment = findAssignment(assignmentId);
        if (assignment.getAttachmentPath() == null)
            throw new RuntimeException("Nuk ka skedar të bashkangjitur");
        return fileStorageService.loadAsResource(assignment.getAttachmentPath());
    }

    public String getAttachmentName(Long assignmentId) {
        return findAssignment(assignmentId).getAttachmentName();
    }

    // ------------------------------------------------------------------
    // Student: submission
    // ------------------------------------------------------------------

    /**
     * Submits or resubmits a file.
     * Late submissions are accepted and flagged; resubmission replaces the file
     * (before the deadline only) while preserving the first-submission timestamp.
     */
    @Transactional
    public AssignmentSubmissionResponse submit(Long assignmentId, MultipartFile file, Long studentId) {
        Assignment assignment = findAssignment(assignmentId);
        validateFile(file);

        Instant now = Instant.now();
        boolean isLate = now.isAfter(assignment.getDeadline());

        Optional<AssignmentSubmission> existing =
                submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);

        if (existing.isPresent()) {
            AssignmentSubmission sub = existing.get();
            if (sub.getGradedAt() != null)
                throw new RuntimeException("Dorëzimi është vlerësuar tashmë dhe nuk mund të zëvendësohet");
            if (isLate)
                throw new RuntimeException("Afati ka kaluar — dorëzimi ekzistues nuk mund të zëvendësohet");
            deleteSubmissionFile(sub);
            sub.setFilePath(storeSubmissionFile(file, assignmentId, studentId));
            sub.setFileName(originalName(file));
            sub.setSubmittedAt(now);
            sub.setLate(false);
            return toSubmissionResponse(submissionRepository.save(sub));
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Studenti nuk u gjet"));

        return toSubmissionResponse(submissionRepository.save(
                AssignmentSubmission.builder()
                        .assignment(assignment).student(student)
                        .filePath(storeSubmissionFile(file, assignmentId, studentId))
                        .fileName(originalName(file))
                        .submittedAt(now)
                        .firstSubmittedAt(now)
                        .late(isLate)
                        .build()
        ));
    }

    public Optional<AssignmentSubmissionResponse> getMySubmission(Long assignmentId, Long studentId) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .map(this::toSubmissionResponse);
    }

    /** All assignments across the student's actively enrolled subjects, with submission status. */
    public List<com.meson.dto.StudentAssignmentOverviewResponse> getStudentOverview(Long studentId) {
        List<Long> subjectIds = enrollmentRepository.findByUserIdAndStatusi(studentId, EnrollmentStatus.AKTIV)
                .stream().map(e -> e.getSubject().getId()).toList();
        if (subjectIds.isEmpty()) return List.of();

        java.util.Map<Long, AssignmentSubmission> submissionByAssignment = new java.util.HashMap<>();
        submissionRepository.findByStudentId(studentId)
                .forEach(s -> submissionByAssignment.put(s.getAssignment().getId(), s));

        Instant now = Instant.now();
        return assignmentRepository.findByLessonModuleSubjectIdIn(subjectIds).stream()
                .map(a -> {
                    AssignmentSubmission sub = submissionByAssignment.get(a.getId());
                    String status;
                    if (sub == null) {
                        status = now.isAfter(a.getDeadline()) ? "MISSED" : "UPCOMING";
                    } else if (sub.getGradedAt() != null) {
                        status = "GRADED";
                    } else {
                        status = sub.isLate() ? "LATE" : "SUBMITTED";
                    }
                    var subject = a.getLesson().getModule().getSubject();
                    return com.meson.dto.StudentAssignmentOverviewResponse.builder()
                            .assignmentId(a.getId())
                            .title(a.getTitle() != null ? a.getTitle() : a.getLesson().getTitulli())
                            .subjectId(subject.getId())
                            .subjectTitle(subject.getTitulli())
                            .lessonId(a.getLesson().getId())
                            .lessonTitle(a.getLesson().getTitulli())
                            .deadline(a.getDeadline())
                            .status(status)
                            .submittedAt(sub != null ? sub.getSubmittedAt() : null)
                            .grade(sub != null ? sub.getGrade() : null)
                            .feedback(sub != null ? sub.getFeedback() : null)
                            .build();
                })
                .sorted(java.util.Comparator.comparing(com.meson.dto.StudentAssignmentOverviewResponse::getDeadline))
                .toList();
    }

    public List<AssignmentSubmissionResponse> getMySubmissions(Long studentId) {
        return submissionRepository.findByStudentId(studentId)
                .stream().map(this::toSubmissionResponse).toList();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private String storeSubmissionFile(MultipartFile file, Long assignmentId, Long studentId) {
        return fileStorageService.store(file, "assignments/" + assignmentId + "/" + studentId);
    }

    private String originalName(MultipartFile file) {
        return file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new RuntimeException("Skedari është bosh");
        if (file.getSize() > maxFileSizeMb * 1024 * 1024)
            throw new RuntimeException("Skedari tejkalon madhësinë maksimale prej " + maxFileSizeMb + " MB");
        String name = originalName(file);
        int dot = name.lastIndexOf('.');
        String ext = dot >= 0 ? name.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_EXTENSIONS.contains(ext))
            throw new RuntimeException("Lloji i skedarit nuk lejohet: ." + ext);
    }

    private Assignment findAssignment(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet"));
    }

    private Assignment findTeacherAssignment(Long id, Long teacherId) {
        return assignmentRepository.findByIdAndLessonModuleSubjectTeacherId(id, teacherId)
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet ose nuk keni akses"));
    }

    private Assignment findTeacherAssignmentByLesson(Long lessonId, Long teacherId) {
        return assignmentRepository.findByLessonId(lessonId)
                .filter(a -> a.getLesson().getModule().getSubject().getTeacher().getId().equals(teacherId))
                .orElseThrow(() -> new RuntimeException("Detyra nuk u gjet ose nuk keni akses"));
    }

    private void verifyTeacherOwnsLesson(Lesson lesson, Long teacherId) {
        if (!lesson.getModule().getSubject().getTeacher().getId().equals(teacherId))
            throw new RuntimeException("Nuk keni akses në këtë leksion");
    }

    private void cleanupFiles(Assignment a) {
        if (a.getAttachmentPath() != null)
            try { fileStorageService.delete(a.getAttachmentPath()); } catch (Exception ignored) {}
    }

    private void deleteSubmissionFile(AssignmentSubmission sub) {
        try { fileStorageService.delete(sub.getFilePath()); } catch (Exception ignored) {}
    }

    AssignmentResponse toResponse(Assignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .title(a.getTitle() != null ? a.getTitle() : a.getLesson().getTitulli())
                .description(a.getDescription() != null ? a.getDescription() : a.getLesson().getPermbajtja())
                .deadline(a.getDeadline())
                .hasAttachment(a.getAttachmentPath() != null)
                .attachmentName(a.getAttachmentName())
                .lessonId(a.getLesson().getId())
                .lessonTitle(a.getLesson().getTitulli())
                .createdAt(a.getCreatedAt())
                .isOpen(Instant.now().isBefore(a.getDeadline()))
                .build();
    }

    AssignmentSubmissionResponse toSubmissionResponse(AssignmentSubmission s) {
        Assignment a = s.getAssignment();
        User student = s.getStudent();
        String status = s.getGradedAt() != null ? "GRADED" : (s.isLate() ? "LATE" : "SUBMITTED");
        return AssignmentSubmissionResponse.builder()
                .id(s.getId())
                .assignmentId(a.getId())
                .assignmentTitle(a.getTitle() != null ? a.getTitle() : a.getLesson().getTitulli())
                .deadline(a.getDeadline())
                .lessonId(a.getLesson().getId())
                .lessonTitle(a.getLesson().getTitulli())
                .studentId(student.getId())
                .studentName(student.getEmri() + " " + student.getMbiemri())
                .studentEmail(student.getEmail())
                .fileName(s.getFileName())
                .submittedAt(s.getSubmittedAt())
                .firstSubmittedAt(s.getFirstSubmittedAt())
                .late(s.isLate())
                .grade(s.getGrade())
                .feedback(s.getFeedback())
                .gradedAt(s.getGradedAt())
                .status(status)
                .build();
    }
}
