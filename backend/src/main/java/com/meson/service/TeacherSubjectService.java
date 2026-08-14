package com.meson.service;

import com.meson.dto.SubjectResponse;
import com.meson.dto.SubjectRequest;
import com.meson.dto.TeacherStatsDTO;
import com.meson.entity.Subject;
import com.meson.entity.User;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherSubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ModuleRepository moduleRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;

    public List<SubjectResponse> getOwnSubjects() {
        User teacher = getCurrentUser();
        List<Subject> subjects = subjectRepository.findByTeacherId(teacher.getId());
        if (subjects.isEmpty()) {
            return List.of();
        }

        List<Long> subjectIds = subjects.stream().map(Subject::getId).toList();
        Map<Long, Long> moduleCounts = moduleRepository.countBySubjectIdIn(subjectIds).stream()
                .collect(Collectors.toMap(ModuleRepository.SubjectModuleCount::getSubjectId,
                        ModuleRepository.SubjectModuleCount::getModuleCount));
        Map<Long, Long> enrollmentCounts = enrollmentRepository.countBySubjectIdIn(subjectIds).stream()
                .collect(Collectors.toMap(EnrollmentRepository.SubjectEnrollmentCount::getSubjectId,
                        EnrollmentRepository.SubjectEnrollmentCount::getEnrollmentCount));

        return subjects.stream()
                .map(subject -> toResponse(subject,
                        moduleCounts.getOrDefault(subject.getId(), 0L),
                        enrollmentCounts.getOrDefault(subject.getId(), 0L)))
                .collect(Collectors.toList());
    }

    public SubjectResponse getOwnSubjectById(Long id) {
        User teacher = getCurrentUser();
        Subject subject = subjectRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));
        return toResponse(subject);
    }

    public SubjectResponse updateSubjectBasicInfo(Long id, SubjectRequest request) {
        User teacher = getCurrentUser();
        Subject subject = subjectRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        subject.setTitulli(request.getTitulli());
        subject.setPershkrimi(request.getPershkrimi());
        subject.setEcts(request.getEcts() != null ? request.getEcts() : 5);
        subject.setNiveli(request.getNiveli());
        subject.setStatusi(request.getStatusi());
        subject.setSemester(request.getSemester());

        return toResponse(subjectRepository.save(subject));
    }

    public TeacherStatsDTO getStats() {
        User teacher = getCurrentUser();
        long totalSubjects = subjectRepository.countByTeacherId(teacher.getId());
        long totalStudents = enrollmentRepository.countDistinctStudentsByTeacherId(teacher.getId());
        long totalQuizzes = quizRepository.countByLessonModuleSubjectTeacherId(teacher.getId());
        long totalAssignments = assignmentRepository.countByLessonModuleSubjectTeacherId(teacher.getId());

        return new TeacherStatsDTO(totalSubjects, totalStudents, totalQuizzes, totalAssignments);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    /** Single-subject path (getOwnSubjectById/update) — one row, so per-row counts are fine here. */
    private SubjectResponse toResponse(Subject subject) {
        return toResponse(subject,
                moduleRepository.countBySubjectId(subject.getId()),
                enrollmentRepository.countBySubjectId(subject.getId()));
    }

    private SubjectResponse toResponse(Subject subject, long moduleCount, long studentCount) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .titulli(subject.getTitulli())
                .pershkrimi(subject.getPershkrimi())
                .teacherId(subject.getTeacher().getId())
                .teacherName(subject.getTeacher().getEmri() + " " + subject.getTeacher().getMbiemri())
                .departmentId(subject.getDepartment() != null ? subject.getDepartment().getId() : null)
                .departmentName(subject.getDepartment() != null ? subject.getDepartment().getEmertimi() : null)
                .semester(subject.getSemester())
                .ects(subject.getEcts())
                .niveli(subject.getNiveli())
                .statusi(subject.getStatusi())
                .moduleCount((int) moduleCount)
                .studentCount((int) studentCount)
                .createdAt(subject.getCreatedAt())
                .build();
    }
}
