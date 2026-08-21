package com.meson.service;

import com.meson.dto.DepartmentHeadDashboardResponse;
import com.meson.dto.EnrollmentResponse;
import com.meson.entity.Department;
import com.meson.entity.Enrollment;
import com.meson.entity.Subject;
import com.meson.entity.User;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.SubjectRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentHeadService {

    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public DepartmentHeadDashboardResponse getDashboard() {
        Department department = getOwnDepartment();
        List<Subject> subjects = subjectRepository.findByDepartmentId(department.getId());
        long teacherCount = subjects.stream()
                .map(s -> s.getTeacher().getId())
                .distinct()
                .count();

        return DepartmentHeadDashboardResponse.builder()
                .departmentId(department.getId())
                .departmentName(department.getEmertimi())
                .subjectCount(subjects.size())
                .teacherCount(teacherCount)
                .studentCount(enrollmentRepository.countDistinctStudentsByDepartmentId(department.getId()))
                .build();
    }

    public List<EnrollmentResponse> getStudents() {
        Department department = getOwnDepartment();
        return enrollmentRepository.findBySubjectDepartmentId(department.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private Department getOwnDepartment() {
        User user = getCurrentUser();
        return departmentRepository.findByHeadId(user.getId())
                .orElseThrow(() -> new AccessDeniedException("Nuk jeni caktuar si kryetar departamenti"));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet."));
    }

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .userEmri(enrollment.getUser().getEmri() + " " + enrollment.getUser().getMbiemri())
                .subjectId(enrollment.getSubject().getId())
                .subjectTitulli(enrollment.getSubject().getTitulli())
                .progresi(enrollment.getProgresi())
                .statusi(enrollment.getStatusi())
                .dataRegjistrimit(enrollment.getDataRegjistrimit())
                .build();
    }
}
