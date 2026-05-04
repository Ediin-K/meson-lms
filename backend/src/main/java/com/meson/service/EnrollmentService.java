// EnrollmentService.java
package com.meson.service;

import com.meson.dto.EnrollmentRequest;
import com.meson.dto.EnrollmentResponse;
import com.meson.entity.*;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public List<EnrollmentResponse> getAll() {
        return enrollmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EnrollmentResponse> getByUserId(Long userId) {
        return enrollmentRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EnrollmentResponse> getByCourseId(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EnrollmentResponse getById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regjistrimi nuk u gjet"));
        return toResponse(enrollment);
    }

    public EnrollmentResponse create(EnrollmentRequest request) {
        if (enrollmentRepository.existsByUserIdAndCourseId(request.getUserId(), request.getCourseId())) {
            throw new RuntimeException("Studenti eshte tashme i regjistruar ne kete kurs");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Kursi nuk u gjet"));

        if (course.getEnrollmentKey() != null && !course.getEnrollmentKey().isEmpty()) {
            if (!course.getEnrollmentKey().equals(request.getEnrollmentKey())) {
                throw new RuntimeException("Kodi i regjistrimit është i gabuar");
            }
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet"));

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);

        return toResponse(enrollmentRepository.save(enrollment));
    }

    public EnrollmentResponse updateProgresi(Long id, Double progresi) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regjistrimi nuk u gjet"));
        enrollment.setProgresi(progresi);
        return toResponse(enrollmentRepository.save(enrollment));
    }

    public EnrollmentResponse updateStatusi(Long id, EnrollmentStatus statusi) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regjistrimi nuk u gjet"));
        enrollment.setStatusi(statusi);
        return toResponse(enrollmentRepository.save(enrollment));
    }

    public void delete(Long id) {
        if (!enrollmentRepository.existsById(id)) {
            throw new RuntimeException("Regjistrimi nuk u gjet");
        }
        enrollmentRepository.deleteById(id);
    }

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .userEmri(enrollment.getUser().getEmri())
                .courseId(enrollment.getCourse().getId())
                .courseTitulli(enrollment.getCourse().getTitulli())
                .progresi(enrollment.getProgresi())
                .statusi(enrollment.getStatusi())
                .dataRegjistrimit(enrollment.getDataRegjistrimit())
                .build();
    }
}