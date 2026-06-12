
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
    private final SubjectRepository subjectRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectSubgroupRepository subjectSubgroupRepository;
    private final SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    private final SubjectSubgroupTeacherRepository subjectSubgroupTeacherRepository;

    public org.springframework.data.domain.Page<EnrollmentResponse> getPage(String search, String status,
            org.springframework.data.domain.Pageable pageable) {
        com.meson.entity.EnrollmentStatus statusFilter = null;
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            statusFilter = com.meson.entity.EnrollmentStatus.valueOf(status.toUpperCase());
        }
        return enrollmentRepository.searchPage(search == null ? "" : search.trim(), statusFilter, pageable)
                .map(this::toResponse);
    }

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

    public List<EnrollmentResponse> getBySubjectId(Long subjectId) {
        return enrollmentRepository.findBySubjectId(subjectId)
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
        if (enrollmentRepository.existsByUserIdAndSubjectId(request.getUserId(), request.getSubjectId())) {
            throw new RuntimeException("Studenti eshte tashme i regjistruar ne kete kurs");
        }

        Subject course = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Lënda nuk u gjet"));

        if (course.getEnrollmentKey() != null && !course.getEnrollmentKey().isEmpty()) {
            if (!course.getEnrollmentKey().equals(request.getEnrollmentKey())) {
                throw new RuntimeException("Kodi i regjistrimit është i gabuar");
            }
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet"));

        SubjectGroup subjectGroup = null;
        SubjectSubgroup subjectSubgroup = null;

        if (request.getSubjectGroupId() != null) {
            subjectGroup = subjectGroupRepository.findById(request.getSubjectGroupId())
                    .orElseThrow(() -> new RuntimeException("Grupi nuk u gjet"));

            if (!subjectGroup.getSubject().getId().equals(course.getId())) {
                throw new RuntimeException("Grupi nuk i perket ketij Lënda");
            }
        }

        if (request.getSubjectSubgroupId() != null) {
            subjectSubgroup = subjectSubgroupRepository.findById(request.getSubjectSubgroupId())
                    .orElseThrow(() -> new RuntimeException("Nengrupi nuk u gjet"));

            if (subjectGroup == null) {
                subjectGroup = subjectSubgroup.getSubjectGroup();
            }

            if (!subjectSubgroup.getSubjectGroup().getId().equals(subjectGroup.getId())) {
                throw new RuntimeException("Nengrupi nuk i perket grupit te zgjedhur");
            }

            if (!subjectGroup.getSubject().getId().equals(course.getId())) {
                throw new RuntimeException("Nengrupi nuk i perket ketij Lënda");
            }
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setSubject(course);
        enrollment.setSubjectGroup(subjectGroup);
        enrollment.setSubjectSubgroup(subjectSubgroup);

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
                .subjectId(enrollment.getSubject().getId())
                .subjectTitulli(enrollment.getSubject().getTitulli())
                .subjectEcts(resolveSubjectEcts(enrollment.getSubject()))
                .subjectGroupId(enrollment.getSubjectGroup() != null ? enrollment.getSubjectGroup().getId() : null)
                .subjectGroupName(enrollment.getSubjectGroup() != null ? enrollment.getSubjectGroup().getName() : null)
                .subjectSubgroupId(enrollment.getSubjectSubgroup() != null ? enrollment.getSubjectSubgroup().getId() : null)
                .subjectSubgroupName(enrollment.getSubjectSubgroup() != null ? enrollment.getSubjectSubgroup().getName() : null)
                .professorName(resolveProfessorName(enrollment))
                .assistantName(resolveAssistantName(enrollment))
                .progresi(enrollment.getProgresi())
                .statusi(enrollment.getStatusi())
                .dataRegjistrimit(enrollment.getDataRegjistrimit())
                .build();
    }

    private String resolveProfessorName(Enrollment enrollment) {
        if (enrollment.getSubjectGroup() == null) {
            User teacher = enrollment.getSubject().getTeacher();
            return teacher != null ? teacher.getEmri() + " " + teacher.getMbiemri() : null;
        }

        return subjectGroupTeacherRepository.findBySubjectGroupId(enrollment.getSubjectGroup().getId())
                .stream()
                .findFirst()
                .map(assignment -> assignment.getTeacher().getEmri() + " " + assignment.getTeacher().getMbiemri())
                .orElse(null);
    }

    private String resolveAssistantName(Enrollment enrollment) {
        if (enrollment.getSubjectSubgroup() == null) {
            return null;
        }

        return subjectSubgroupTeacherRepository.findBySubjectSubgroupId(enrollment.getSubjectSubgroup().getId())
                .stream()
                .findFirst()
                .map(assignment -> assignment.getTeacher().getEmri() + " " + assignment.getTeacher().getMbiemri())
                .orElse(null);
    }

    private int resolveSubjectEcts(Subject course) {
        if (course == null || course.getEcts() == null) {
            return 5;
        }
        return course.getEcts();
    }
}
