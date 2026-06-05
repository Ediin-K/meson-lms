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
        return subjectRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::toResponse)
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
        subject.setCmimi(request.getCmimi());
        subject.setEcts(request.getEcts() != null ? request.getEcts() : 5);
        subject.setNiveli(request.getNiveli());
        subject.setStatusi(request.getStatusi());
        subject.setSemester(request.getSemester());

        return toResponse(subjectRepository.save(subject));
    }

    public TeacherStatsDTO getStats() {
        User teacher = getCurrentUser();
        long totalSubjects = subjectRepository.countByTeacherId(teacher.getId());
        long totalStudents = enrollmentRepository.countBySubjectTeacherId(teacher.getId());
        long totalQuizzes = quizRepository.countByLessonModuleSubjectTeacherId(teacher.getId());
        long totalAssignments = assignmentRepository.countByLessonModuleSubjectTeacherId(teacher.getId());

        return new TeacherStatsDTO(totalSubjects, totalStudents, totalQuizzes, totalAssignments);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    private SubjectResponse toResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .titulli(subject.getTitulli())
                .pershkrimi(subject.getPershkrimi())
                .teacherId(subject.getTeacher().getId())
                .teacherName(subject.getTeacher().getEmri() + " " + subject.getTeacher().getMbiemri())
                .categoryId(subject.getDirection() != null ? subject.getDirection().getId() : null)
                .categoryName(subject.getDirection() != null ? subject.getDirection().getEmertimi() : null)
                .semester(subject.getSemester())
                .cmimi(subject.getCmimi())
                .ects(subject.getEcts())
                .niveli(subject.getNiveli())
                .statusi(subject.getStatusi())
                .moduleCount((int) moduleRepository.countBySubjectId(subject.getId()))
                .studentCount((int) enrollmentRepository.countBySubjectId(subject.getId()))
                .createdAt(subject.getCreatedAt())
                .build();
    }
}
