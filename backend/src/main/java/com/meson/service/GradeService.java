package com.meson.service;

import com.meson.dto.GradeRequest;
import com.meson.dto.GradeResponse;
import com.meson.dto.StudentGradesSummaryResponse;
import com.meson.entity.Course;
import com.meson.entity.EnrollmentStatus;
import com.meson.entity.Grade;
import com.meson.entity.User;
import com.meson.repository.CourseRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.GradeRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public StudentGradesSummaryResponse getByStudentId(Long studentId) {
        List<GradeResponse> grades = gradeRepository.findByStudentId(studentId)
                .stream()
                .map(this::toResponse)
                .toList();

        int totalEnrolledEcts = enrollmentRepository.findByUserId(studentId)
                .stream()
                .filter(e -> e.getStatusi() != EnrollmentStatus.ANULUAR)
                .mapToInt(e -> resolveCourseEcts(e.getCourse()))
                .sum();

        return buildSummary(grades, totalEnrolledEcts);
    }

    @Transactional(readOnly = true)
    public List<GradeResponse> getByCourseId(Long courseId) {
        assertCanManageCourse(courseId);
        return gradeRepository.findByCourseId(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GradeResponse create(GradeRequest request) {
        assertCanManageCourse(request.getCourseId());

        if (gradeRepository.existsByStudentIdAndCourseId(request.getStudentId(), request.getCourseId())) {
            throw new RuntimeException("Studenti ka nje note ekzistuese per kete kurs");
        }

        if (!enrollmentRepository.existsByUserIdAndCourseId(request.getStudentId(), request.getCourseId())) {
            throw new RuntimeException("Studenti nuk eshte i regjistruar ne kete kurs");
        }

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Studenti nuk u gjet"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Kursi nuk u gjet"));

        User professor = getCurrentUser();

        Grade grade = Grade.builder()
                .student(student)
                .course(course)
                .professor(professor)
                .grade(request.getGrade())
                .comment(request.getComment())
                .assignedAt(LocalDateTime.now())
                .build();

        return toResponse(gradeRepository.save(grade));
    }

    @Transactional
    public GradeResponse update(Long id, GradeRequest request) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota nuk u gjet"));

        assertCanManageCourse(grade.getCourse().getId());

        if (!grade.getStudent().getId().equals(request.getStudentId())
                || !grade.getCourse().getId().equals(request.getCourseId())) {
            throw new RuntimeException("Nuk lejohet ndryshimi i studentit ose kursit per nje note ekzistuese");
        }

        grade.setGrade(request.getGrade());
        grade.setComment(request.getComment());
        grade.setAssignedAt(LocalDateTime.now());

        return toResponse(gradeRepository.save(grade));
    }

    @Transactional
    public void delete(Long id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota nuk u gjet"));
        assertCanManageCourse(grade.getCourse().getId());
        gradeRepository.delete(grade);
    }

    private void assertCanManageCourse(Long courseId) {
        if (hasRole("ADMIN")) {
            return;
        }
        if (!hasRole("TEACHER")) {
            throw new AccessDeniedException("Nuk keni qasje per te menaxhuar notat");
        }
        User teacher = getCurrentUser();
        courseRepository.findByIdAndTeacherId(courseId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses ne kete kurs"));
    }

    private StudentGradesSummaryResponse buildSummary(List<GradeResponse> grades, int totalEnrolledEcts) {
        double average = grades.isEmpty()
                ? 0.0
                : grades.stream().mapToInt(GradeResponse::getGrade).average().orElse(0.0);
        int totalEcts = grades.stream()
                .mapToInt(g -> g.getCourseEcts() != null ? g.getCourseEcts() : 5)
                .sum();
        return StudentGradesSummaryResponse.builder()
                .grades(grades)
                .averageGrade(Math.round(average * 100.0) / 100.0)
                .totalGrades(grades.size())
                .totalEcts(totalEcts)
                .totalEnrolledEcts(totalEnrolledEcts)
                .build();
    }

    private int resolveCourseEcts(Course course) {
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
                .courseId(grade.getCourse().getId())
                .courseTitulli(grade.getCourse().getTitulli())
                .courseEcts(resolveCourseEcts(grade.getCourse()))
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
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet"));
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
