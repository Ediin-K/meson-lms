package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmisService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ExamApplicationRepository examApplicationRepository;
    private final GradeRepository gradeRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    private final SubjectSubgroupRepository subjectSubgroupRepository;
    private final SubjectSubgroupTeacherRepository subjectSubgroupTeacherRepository;

    @Transactional(readOnly = true)
    public List<SmisCourseResponse> getAvailableCourses() {
        List<SmisProfessorOptionResponse> professors = userRepository.findAllByRoleNormalizedName("TEACHER")
                .stream()
                .map(this::toProfessorOption)
                .toList();
        Set<Long> alreadyAppliedSubjectIds = activeApplicationSubjectIdsForCurrentStudent();

        return subjectRepository.findByStatusi(SubjectStatus.PUBLIKUAR)
                .stream()
                .filter(this::isComputerScienceCourse)
                .filter(subject -> !alreadyAppliedSubjectIds.contains(subject.getId()))
                .sorted(Comparator.comparing(Subject::getSemester).thenComparing(this::courseCode))
                .map(subject -> toCourseResponse(subject, professorsForCourse(subject, professors)))
                .toList();
    }

    @Transactional
    public ExamApplicationResponse registerExam(Long studentId, ExamApplicationRequest request) {
        if (!getCurrentUser().getId().equals(studentId) && !hasRole("ADMIN")) {
            throw new AccessDeniedException("Nuk keni qasje per kete student");
        }

        if (examApplicationRepository.existsByStudentIdAndSubjectIdAndStatusIn(
                studentId,
                request.getCourseId(),
                List.of(ExamApplicationStatus.REGISTERED, ExamApplicationStatus.GRADED))) {
            throw new BadRequestException("Provimi eshte paraqitur tashme per kete lende");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Studenti nuk u gjet"));
        Subject subject = subjectRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Kursi nuk u gjet"));
        User professor = userRepository.findById(request.getProfessorId())
                .orElseThrow(() -> new ResourceNotFoundException("Profesori nuk u gjet"));

        ExamApplication application = ExamApplication.builder()
                .student(student)
                .subject(subject)
                .professor(professor)
                .status(ExamApplicationStatus.REGISTERED)
                .appliedAt(LocalDateTime.now())
                .build();

        return toResponse(examApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<ExamApplicationResponse> getStudentApplications(Long studentId) {
        if (!getCurrentUser().getId().equals(studentId) && !hasRole("ADMIN") && !hasRole("TEACHER")) {
            throw new AccessDeniedException("Nuk keni qasje per kete student");
        }
        return examApplicationRepository.findByStudentIdOrderByAppliedAtDesc(studentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ExamApplicationResponse cancelApplication(Long studentId, Long applicationId) {
        ExamApplication application = examApplicationRepository.findByIdAndStudentId(applicationId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Paraqitja e provimit nuk u gjet"));
        if (application.getGrade() != null || application.getStatus() == ExamApplicationStatus.GRADED) {
            throw new BadRequestException("Paraqitja nuk mund te anulohet pasi eshte vendosur nota");
        }
        application.setStatus(ExamApplicationStatus.CANCELLED);
        application.setCancelledAt(LocalDateTime.now());
        return toResponse(examApplicationRepository.save(application));
    }

    @Transactional
    public ExamApplicationResponse refuseGrade(Long studentId, Long applicationId) {
        ExamApplication application = examApplicationRepository.findByIdAndStudentId(applicationId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Paraqitja e provimit nuk u gjet"));
        if (application.getGrade() == null || application.getStatus() != ExamApplicationStatus.GRADED) {
            throw new BadRequestException("Nota mund te refuzohet vetem pasi te vendoset nga profesori");
        }
        application.setStatus(ExamApplicationStatus.REFUSED);
        application.setRejectedAt(LocalDateTime.now());
        return toResponse(examApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<ExamApplicationResponse> getProfessorApplications() {
        User professor = getCurrentUser();
        return examApplicationRepository.findByProfessorIdOrderByAppliedAtDesc(professor.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ExamApplicationResponse submitGrade(Long applicationId, ExamGradeRequest request) {
        User professor = getCurrentUser();
        ExamApplication application = hasRole("ADMIN")
                ? examApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Paraqitja e provimit nuk u gjet"))
                : examApplicationRepository.findByIdAndProfessorId(applicationId, professor.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni qasje ne kete paraqitje"));

        if (application.getStatus() == ExamApplicationStatus.CANCELLED) {
            throw new BadRequestException("Nuk mund te vendoset nota per provim te anuluar");
        }

        Grade grade = application.getGrade();
        if (grade == null) {
            grade = gradeRepository.findByStudentIdAndSubjectId(
                    application.getStudent().getId(),
                    application.getSubject().getId()).orElse(null);
        }
        if (grade == null) {
            grade = Grade.builder()
                    .student(application.getStudent())
                    .subject(application.getSubject())
                    .professor(application.getProfessor())
                    .grade(request.getGrade())
                    .comment(request.getComment())
                    .assignedAt(LocalDateTime.now())
                    .build();
        } else {
            grade.setGrade(request.getGrade());
            grade.setComment(request.getComment());
            grade.setAssignedAt(LocalDateTime.now());
        }

        Grade savedGrade = gradeRepository.save(grade);
        application.setGrade(savedGrade);
        application.setStatus(ExamApplicationStatus.GRADED);
        application.setGradeAssignedAt(savedGrade.getAssignedAt());
        application.setRejectedAt(null);

        return toResponse(examApplicationRepository.save(application));
    }

    @Transactional
    public ExamApplicationResponse deleteGrade(Long applicationId) {
        User professor = getCurrentUser();
        ExamApplication application = hasRole("ADMIN")
                ? examApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Paraqitja e provimit nuk u gjet"))
                : examApplicationRepository.findByIdAndProfessorId(applicationId, professor.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni qasje ne kete paraqitje"));

        Grade grade = application.getGrade();
        if (grade == null) {
            grade = gradeRepository.findByStudentIdAndSubjectId(
                    application.getStudent().getId(),
                    application.getSubject().getId()).orElse(null);
        }

        if (grade == null) {
            throw new BadRequestException("Kjo paraqitje nuk ka note per fshirje");
        }

        application.setGrade(null);
        application.setStatus(ExamApplicationStatus.REGISTERED);
        application.setGradeAssignedAt(null);
        application.setRejectedAt(null);
        ExamApplication saved = examApplicationRepository.saveAndFlush(application);
        gradeRepository.delete(grade);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExamApplicationResponse> getAdminApplications(String status) {
        if (status == null || status.isBlank()) {
            return examApplicationRepository.findAllByOrderByAppliedAtDesc().stream().map(this::toResponse).toList();
        }
        ExamApplicationStatus resolved = ExamApplicationStatus.valueOf(status.trim().toUpperCase());
        return examApplicationRepository.findByStatusOrderByAppliedAtDesc(resolved).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SmisAdminSummaryResponse getAdminSummary() {
        Map<ExamApplicationStatus, Long> counts = examApplicationRepository.findAll()
                .stream()
                .collect(java.util.stream.Collectors.groupingBy(ExamApplication::getStatus, java.util.stream.Collectors.counting()));
        return SmisAdminSummaryResponse.builder()
                .registered(counts.getOrDefault(ExamApplicationStatus.REGISTERED, 0L))
                .graded(counts.getOrDefault(ExamApplicationStatus.GRADED, 0L))
                .refused(counts.getOrDefault(ExamApplicationStatus.REFUSED, 0L))
                .cancelled(counts.getOrDefault(ExamApplicationStatus.CANCELLED, 0L))
                .total(counts.values().stream().mapToLong(Long::longValue).sum())
                .build();
    }

    private SmisCourseResponse toCourseResponse(Subject subject, List<SmisProfessorOptionResponse> professors) {
        return SmisCourseResponse.builder()
                .id(subject.getId())
                .code(courseCode(subject))
                .name(subject.getTitulli())
                .ects(subject.getEcts())
                .semester(subject.getSemester())
                .category(courseCategory(subject))
                .professors(professors)
                .build();
    }

    private SmisProfessorOptionResponse toProfessorOption(User professor) {
        return SmisProfessorOptionResponse.builder()
                .id(professor.getId())
                .name(professor.getEmri() + " " + professor.getMbiemri())
                .email(professor.getEmail())
                .build();
    }

    private List<SmisProfessorOptionResponse> professorsForCourse(
            Subject subject,
            List<SmisProfessorOptionResponse> allProfessors) {
        Set<Long> teacherIds = teacherIdsForSubject(subject);
        return allProfessors.stream()
                .filter(professor -> teacherIds.contains(professor.getId()))
                .toList();
    }

    /** Every teacher actually assigned to this subject: its primary teacher plus any group/subgroup teachers. */
    private Set<Long> teacherIdsForSubject(Subject subject) {
        Set<Long> teacherIds = new java.util.HashSet<>();
        if (subject.getTeacher() != null) {
            teacherIds.add(subject.getTeacher().getId());
        }
        for (SubjectGroup group : subjectGroupRepository.findBySubjectId(subject.getId())) {
            subjectGroupTeacherRepository.findBySubjectGroupId(group.getId())
                    .forEach(gt -> teacherIds.add(gt.getTeacher().getId()));
            for (SubjectSubgroup subgroup : subjectSubgroupRepository.findBySubjectGroupId(group.getId())) {
                subjectSubgroupTeacherRepository.findBySubjectSubgroupId(subgroup.getId())
                        .forEach(sgt -> teacherIds.add(sgt.getTeacher().getId()));
            }
        }
        return teacherIds;
    }

    private ExamApplicationResponse toResponse(ExamApplication application) {
        Grade grade = application.getGrade();
        Subject subject = application.getSubject();
        return ExamApplicationResponse.builder()
                .id(application.getId())
                .studentId(application.getStudent().getId())
                .studentName(application.getStudent().getEmri() + " " + application.getStudent().getMbiemri())
                .studentEmail(application.getStudent().getEmail())
                .courseId(subject.getId())
                .courseCode(courseCode(subject))
                .courseName(subject.getTitulli())
                .courseEcts(subject.getEcts())
                .semester(subject.getSemester())
                .category(courseCategory(subject))
                .professorId(application.getProfessor().getId())
                .professorName(application.getProfessor().getEmri() + " " + application.getProfessor().getMbiemri())
                .status(application.getStatus())
                .appliedAt(application.getAppliedAt())
                .grade(grade != null ? grade.getGrade() : null)
                .gradeStatus(application.getStatus().name())
                .comment(grade != null ? grade.getComment() : null)
                .gradeAssignedAt(application.getGradeAssignedAt())
                .rejectedAt(application.getRejectedAt())
                .cancelledAt(application.getCancelledAt())
                .build();
    }

    private String courseCode(Subject subject) {
        if (subject.getCode() != null && !subject.getCode().isBlank()) {
            return subject.getCode();
        }
        return "MESON" + String.format("%03d", subject.getId());
    }

    private String courseCategory(Subject subject) {
        return subject.getDepartment() != null ? subject.getDepartment().getEmertimi() : "Pa kategori";
    }

    private boolean isComputerScienceCourse(Subject subject) {
        return subject.getDepartment() != null
                && "Shkenca kompjuterike dhe inxhinieri".equalsIgnoreCase(subject.getDepartment().getEmertimi());
    }

    private Set<Long> activeApplicationSubjectIdsForCurrentStudent() {
        if (!hasRole("STUDENT")) {
            return Set.of();
        }
        Long studentId = getCurrentUser().getId();
        return examApplicationRepository.findByStudentIdOrderByAppliedAtDesc(studentId)
                .stream()
                .filter(application -> application.getStatus() == ExamApplicationStatus.REGISTERED
                        || application.getStatus() == ExamApplicationStatus.GRADED)
                .map(application -> application.getSubject().getId())
                .collect(Collectors.toSet());
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
        return auth.getAuthorities().stream().anyMatch(a -> target.equals(a.getAuthority()));
    }
}