package com.meson.service;

import com.meson.dto.GradeAuditLogResponse;
import com.meson.dto.GradeRequest;
import com.meson.dto.GradeResponse;
import com.meson.dto.SemesterSummaryResponse;
import com.meson.dto.StudentGradesSummaryResponse;
import com.meson.entity.GradeAuditAction;
import com.meson.entity.GradeAuditLog;
import com.meson.entity.Subject;
import com.meson.entity.EnrollmentStatus;
import com.meson.entity.Grade;
import com.meson.entity.User;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.SubjectRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.GradeAuditLogRepository;
import com.meson.repository.GradeRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final GradeAuditLogRepository gradeAuditLogRepository;

    @Transactional(readOnly = true)
    public StudentGradesSummaryResponse getByStudentId(Long studentId) {
        List<GradeResponse> grades = gradeRepository.findByStudentId(studentId)
                .stream()
                .map(this::toResponse)
                .toList();

        int totalEnrolledEcts = enrollmentRepository.findByUserId(studentId)
                .stream()
                .filter(e -> e.getStatusi() != EnrollmentStatus.ANULUAR)
                .mapToInt(e -> resolveSubjectEcts(e.getSubject()))
                .sum();

        return buildSummary(grades, totalEnrolledEcts);
    }

    @Transactional(readOnly = true)
    public List<GradeResponse> getBySubjectId(Long subjectId) {
        assertCanManageSubject(subjectId);
        return gradeRepository.findBySubjectId(subjectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GradeResponse create(GradeRequest request) {
        assertCanManageSubject(request.getSubjectId());

        if (gradeRepository.existsByStudentIdAndSubjectId(request.getStudentId(), request.getSubjectId())) {
            throw new RuntimeException("Studenti ka nje note ekzistuese per kete kurs");
        }

        if (!enrollmentRepository.existsByUserIdAndSubjectId(request.getStudentId(), request.getSubjectId())) {
            throw new RuntimeException("Studenti nuk eshte i regjistruar ne kete kurs");
        }

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Studenti nuk u gjet"));

        Subject course = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Lënda nuk u gjet"));

        User professor = getCurrentUser();

        Grade grade = Grade.builder()
                .student(student)
                .subject(course)
                .professor(professor)
                .grade(request.getGrade())
                .comment(request.getComment())
                .assignedAt(LocalDateTime.now())
                .build();

        grade = gradeRepository.save(grade);
        logAudit(grade, GradeAuditAction.CREATED, null, grade.getGrade());
        notifyGradePosted(grade);
        return toResponse(grade);
    }

    @Transactional
    public GradeResponse update(Long id, GradeRequest request) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nota nuk u gjet"));

        assertCanManageSubject(grade.getSubject().getId());

        if (!grade.getStudent().getId().equals(request.getStudentId())
                || !grade.getSubject().getId().equals(request.getSubjectId())) {
            throw new RuntimeException("Nuk lejohet ndryshimi i studentit ose Lëndat per nje note ekzistuese");
        }

        int previousGrade = grade.getGrade();
        grade.setGrade(request.getGrade());
        grade.setComment(request.getComment());
        grade.setAssignedAt(LocalDateTime.now());

        grade = gradeRepository.save(grade);
        logAudit(grade, GradeAuditAction.UPDATED, previousGrade, grade.getGrade());
        return toResponse(grade);
    }

    @Transactional
    public void delete(Long id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nota nuk u gjet"));
        assertCanManageSubject(grade.getSubject().getId());
        logAudit(grade, GradeAuditAction.DELETED, grade.getGrade(), null);
        gradeRepository.delete(grade);
    }

    @Transactional(readOnly = true)
    public List<GradeAuditLogResponse> getHistoryForGrade(Long gradeId) {
        List<GradeAuditLog> logs = gradeAuditLogRepository.findByGradeIdOrderByPerformedAtAsc(gradeId);
        if (!logs.isEmpty()) {
            assertCanManageSubject(logs.get(0).getSubjectId());
        } else {
            gradeRepository.findById(gradeId)
                    .ifPresent(g -> assertCanManageSubject(g.getSubject().getId()));
        }
        return logs.stream().map(this::toAuditResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<GradeAuditLogResponse> getAuditLog(Pageable pageable) {
        if (hasRole("ADMIN")) {
            return gradeAuditLogRepository.findAll(pageable).map(this::toAuditResponse);
        }
        if (hasRole("TEACHER")) {
            List<Long> subjectIds = subjectRepository.findByTeacherId(getCurrentUser().getId())
                    .stream().map(Subject::getId).toList();
            return gradeAuditLogRepository.findBySubjectIdIn(subjectIds, pageable)
                    .map(this::toAuditResponse);
        }
        throw new AccessDeniedException("Nuk keni qasje ne historikun e notave");
    }

    /** Best-effort: a notification failure must never undo a grade that was already posted. */
    private void notifyGradePosted(Grade grade) {
        try {
            emailService.sendGradePostedEmail(grade.getStudent(), grade.getSubject(), grade.getGrade());
        } catch (RuntimeException e) {
            log.warn("Failed to send grade-posted email for grade {}: {}", grade.getId(), e.getMessage());
        }
        try {
            notificationService.create(grade.getStudent(),
                    "Nota u vendos",
                    "Nota juaj për \"" + grade.getSubject().getTitulli() + "\" u vendos: " + grade.getGrade() + ".");
        } catch (RuntimeException e) {
            log.warn("Failed to create grade-posted notification for grade {}: {}", grade.getId(), e.getMessage());
        }
    }

    private void logAudit(Grade grade, GradeAuditAction action, Integer previousGrade, Integer newGrade) {
        User performer = getCurrentUser();
        gradeAuditLogRepository.save(GradeAuditLog.builder()
                .gradeId(grade.getId())
                .studentId(grade.getStudent().getId())
                .studentName(grade.getStudent().getEmri() + " " + grade.getStudent().getMbiemri())
                .subjectId(grade.getSubject().getId())
                .subjectTitulli(grade.getSubject().getTitulli())
                .performedById(performer.getId())
                .performedByName(performer.getEmri() + " " + performer.getMbiemri())
                .action(action)
                .previousGrade(previousGrade)
                .newGrade(newGrade)
                .comment(grade.getComment())
                .performedAt(LocalDateTime.now())
                .build());
    }

    private GradeAuditLogResponse toAuditResponse(GradeAuditLog log) {
        return GradeAuditLogResponse.builder()
                .id(log.getId())
                .gradeId(log.getGradeId())
                .studentId(log.getStudentId())
                .studentName(log.getStudentName())
                .subjectId(log.getSubjectId())
                .subjectTitulli(log.getSubjectTitulli())
                .performedById(log.getPerformedById())
                .performedByName(log.getPerformedByName())
                .action(log.getAction())
                .previousGrade(log.getPreviousGrade())
                .newGrade(log.getNewGrade())
                .comment(log.getComment())
                .performedAt(log.getPerformedAt())
                .build();
    }

    private void assertCanManageSubject(Long subjectId) {
        if (hasRole("ADMIN")) {
            return;
        }
        if (!hasRole("TEACHER")) {
            throw new AccessDeniedException("Nuk keni qasje per te menaxhuar notat");
        }
        User teacher = getCurrentUser();
        subjectRepository.findByIdAndTeacherId(subjectId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kurs"));
    }

    private StudentGradesSummaryResponse buildSummary(List<GradeResponse> grades, int totalEnrolledEcts) {
        int totalEcts = grades.stream()
                .mapToInt(g -> g.getSubjectEcts() != null ? g.getSubjectEcts() : 5)
                .sum();

        List<SemesterSummaryResponse> bySemester = grades.stream()
                .collect(Collectors.groupingBy(GradeResponse::getSubjectSemester))
                .entrySet().stream()
                .map(entry -> SemesterSummaryResponse.builder()
                        .semester(entry.getKey())
                        .grades(entry.getValue())
                        .gpa(weightedGpa(entry.getValue()))
                        .ects(entry.getValue().stream()
                                .mapToInt(g -> g.getSubjectEcts() != null ? g.getSubjectEcts() : 5)
                                .sum())
                        .build())
                .sorted(Comparator.comparingInt(SemesterSummaryResponse::getSemester))
                .toList();

        return StudentGradesSummaryResponse.builder()
                .grades(grades)
                .averageGrade(weightedGpa(grades))
                .totalGrades(grades.size())
                .totalEcts(totalEcts)
                .totalEnrolledEcts(totalEnrolledEcts)
                .bySemester(bySemester)
                .build();
    }

    /** ECTS-weighted GPA: each grade counts in proportion to its subject's credits, not flatly. */
    private double weightedGpa(List<GradeResponse> grades) {
        int ects = grades.stream()
                .mapToInt(g -> g.getSubjectEcts() != null ? g.getSubjectEcts() : 5)
                .sum();
        if (ects == 0) {
            return 0.0;
        }
        double weightedSum = grades.stream()
                .mapToDouble(g -> g.getGrade() * (g.getSubjectEcts() != null ? g.getSubjectEcts() : 5))
                .sum();
        return Math.round((weightedSum / ects) * 100.0) / 100.0;
    }

    private int resolveSubjectEcts(Subject course) {
        if (course == null || course.getEcts() == null) {
            return 5;
        }
        return course.getEcts();
    }

    private GradeResponse toResponse(Grade grade) {
        return GradeResponse.builder()
                .id(grade.getId())
                .studentId(grade.getStudent().getId())
                .studentEmri(grade.getStudent().getEmri())
                .studentMbiemri(grade.getStudent().getMbiemri())
                .subjectId(grade.getSubject().getId())
                .subjectTitulli(grade.getSubject().getTitulli())
                .subjectEcts(resolveSubjectEcts(grade.getSubject()))
                .subjectSemester(grade.getSubject().getSemester())
                .professorId(grade.getProfessor().getId())
                .professorEmri(grade.getProfessor().getEmri() + " " + grade.getProfessor().getMbiemri())
                .grade(grade.getGrade())
                .comment(grade.getComment())
                .assignedAt(grade.getAssignedAt())
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet"));
    }

    private boolean hasRole(String role) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String target = "ROLE_" + role;
        return auth.getAuthorities().stream()
                .anyMatch(a -> target.equals(a.getAuthority()));
    }
}
