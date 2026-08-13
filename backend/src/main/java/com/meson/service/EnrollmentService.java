
package com.meson.service;

import com.meson.dto.EnrollmentRequest;
import com.meson.dto.EnrollmentResponse;
import com.meson.entity.*;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectSubgroupRepository subjectSubgroupRepository;
    private final EnrollmentCompletionService completionService;
    private final SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    private final SubjectSubgroupTeacherRepository subjectSubgroupTeacherRepository;
    private final AcademicTermService academicTermService;
    private final EmailService emailService;

    public org.springframework.data.domain.Page<EnrollmentResponse> getPage(String search, String status,
            org.springframework.data.domain.Pageable pageable) {
        com.meson.entity.EnrollmentStatus statusFilter = null;
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            statusFilter = com.meson.entity.EnrollmentStatus.valueOf(status.toUpperCase());
        }
        org.springframework.data.domain.Page<Enrollment> page = enrollmentRepository.searchPage(
                search == null ? "" : search.trim(), statusFilter, pageable);
        Map<Long, String> professorNames = batchProfessorNames(page.getContent());
        Map<Long, String> assistantNames = batchAssistantNames(page.getContent());
        return page.map(e -> toResponse(e, professorNames, assistantNames));
    }

    public List<EnrollmentResponse> getAll() {
        return toResponseList(enrollmentRepository.findAll());
    }

    public List<EnrollmentResponse> getByUserId(Long userId) {
        return toResponseList(enrollmentRepository.findByUserId(userId));
    }

    public List<EnrollmentResponse> getBySubjectId(Long subjectId) {
        return toResponseList(enrollmentRepository.findBySubjectId(subjectId));
    }

    private List<EnrollmentResponse> toResponseList(List<Enrollment> enrollments) {
        Map<Long, String> professorNames = batchProfessorNames(enrollments);
        Map<Long, String> assistantNames = batchAssistantNames(enrollments);
        return enrollments.stream()
                .map(e -> toResponse(e, professorNames, assistantNames))
                .toList();
    }

    /** One query for every group's teacher, instead of one query per enrollment. */
    private Map<Long, String> batchProfessorNames(List<Enrollment> enrollments) {
        List<Long> groupIds = enrollments.stream()
                .map(Enrollment::getSubjectGroup)
                .filter(Objects::nonNull)
                .map(SubjectGroup::getId)
                .distinct()
                .toList();
        if (groupIds.isEmpty()) {
            return Map.of();
        }
        return subjectGroupTeacherRepository.findBySubjectGroupIdIn(groupIds).stream()
                .collect(Collectors.toMap(
                        a -> a.getSubjectGroup().getId(),
                        a -> a.getTeacher().getEmri() + " " + a.getTeacher().getMbiemri(),
                        (first, second) -> first));
    }

    private Map<Long, String> batchAssistantNames(List<Enrollment> enrollments) {
        List<Long> subgroupIds = enrollments.stream()
                .map(Enrollment::getSubjectSubgroup)
                .filter(Objects::nonNull)
                .map(SubjectSubgroup::getId)
                .distinct()
                .toList();
        if (subgroupIds.isEmpty()) {
            return Map.of();
        }
        return subjectSubgroupTeacherRepository.findBySubjectSubgroupIdIn(subgroupIds).stream()
                .collect(Collectors.toMap(
                        a -> a.getSubjectSubgroup().getId(),
                        a -> a.getTeacher().getEmri() + " " + a.getTeacher().getMbiemri(),
                        (first, second) -> first));
    }

    public EnrollmentResponse getById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regjistrimi nuk u gjet"));
        return toResponse(enrollment);
    }

    public EnrollmentResponse create(EnrollmentRequest request) {
        if (!hasRole("ADMIN")) {
            academicTermService.assertEnrollmentWindowOpen();
        }

        if (enrollmentRepository.existsByUserIdAndSubjectId(request.getUserId(), request.getSubjectId())) {
            throw new RuntimeException("Studenti eshte tashme i regjistruar ne kete kurs");
        }

        Subject course = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Lënda nuk u gjet"));

        if (course.getEnrollmentKey() != null && !course.getEnrollmentKey().isEmpty()) {
            if (!course.getEnrollmentKey().equals(request.getEnrollmentKey())) {
                throw new RuntimeException("Kodi i regjistrimit është i gabuar");
            }
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet"));

        SubjectGroup subjectGroup = null;
        SubjectSubgroup subjectSubgroup = null;

        if (request.getSubjectGroupId() != null) {
            subjectGroup = subjectGroupRepository.findById(request.getSubjectGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grupi nuk u gjet"));

            if (!subjectGroup.getSubject().getId().equals(course.getId())) {
                throw new RuntimeException("Grupi nuk i perket ketij Lënda");
            }
        }

        if (request.getSubjectSubgroupId() != null) {
            subjectSubgroup = subjectSubgroupRepository.findById(request.getSubjectSubgroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nengrupi nuk u gjet"));

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

        Enrollment saved = enrollmentRepository.save(enrollment);
        notifyEnrollmentConfirmed(saved);
        return toResponse(saved);
    }

    /** Best-effort: a notification failure must never undo an enrollment that already went through. */
    private void notifyEnrollmentConfirmed(Enrollment enrollment) {
        try {
            emailService.sendEnrollmentConfirmedEmail(enrollment.getUser(), enrollment.getSubject());
        } catch (RuntimeException e) {
            log.warn("Failed to send enrollment-confirmed email for enrollment {}: {}", enrollment.getId(), e.getMessage());
        }
    }

    public EnrollmentResponse updateProgresi(Long id, Double progresi) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regjistrimi nuk u gjet"));
        enrollment.setProgresi(progresi);
        return toResponse(enrollmentRepository.save(enrollment));
    }

    public EnrollmentResponse updateStatusi(Long id, EnrollmentStatus statusi) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regjistrimi nuk u gjet"));

        // "Përfunduar" is derived from actually finishing all course material — it
        // cannot be set by hand. Admins may set only AKTIV or ANULUAR.
        if (statusi == EnrollmentStatus.PERFUNDUAR) {
            throw new RuntimeException(
                "Statusi 'Përfunduar' caktohet automatikisht kur studenti përfundon të gjithë materialin e lëndës dhe nuk mund të vendoset manualisht.");
        }

        enrollment.setStatusi(statusi);
        enrollmentRepository.save(enrollment);

        // Reactivating: if the student has in fact already viewed everything, let the
        // derived rule immediately re-complete them (and re-issue the certificate).
        if (statusi == EnrollmentStatus.AKTIV) {
            completionService.recalculateEnrollment(enrollment);
        }
        return toResponse(enrollment);
    }

    public void delete(Long id) {
        if (!enrollmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Regjistrimi nuk u gjet");
        }
        enrollmentRepository.deleteById(id);
    }

    /** Single-entity path (getById/create/update) — no batching needed for one row. */
    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return toResponse(enrollment, null, null);
    }

    private EnrollmentResponse toResponse(Enrollment enrollment, Map<Long, String> professorNames,
            Map<Long, String> assistantNames) {
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
                .professorName(resolveProfessorName(enrollment, professorNames))
                .assistantName(resolveAssistantName(enrollment, assistantNames))
                .progresi(enrollment.getProgresi())
                .statusi(enrollment.getStatusi())
                .dataRegjistrimit(enrollment.getDataRegjistrimit())
                .build();
    }

    private String resolveProfessorName(Enrollment enrollment, Map<Long, String> professorNames) {
        if (enrollment.getSubjectGroup() == null) {
            User teacher = enrollment.getSubject().getTeacher();
            return teacher != null ? teacher.getEmri() + " " + teacher.getMbiemri() : null;
        }

        if (professorNames != null) {
            return professorNames.get(enrollment.getSubjectGroup().getId());
        }

        return subjectGroupTeacherRepository.findBySubjectGroupId(enrollment.getSubjectGroup().getId())
                .stream()
                .findFirst()
                .map(assignment -> assignment.getTeacher().getEmri() + " " + assignment.getTeacher().getMbiemri())
                .orElse(null);
    }

    private String resolveAssistantName(Enrollment enrollment, Map<Long, String> assistantNames) {
        if (enrollment.getSubjectSubgroup() == null) {
            return null;
        }

        if (assistantNames != null) {
            return assistantNames.get(enrollment.getSubjectSubgroup().getId());
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

    private boolean hasRole(String role) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String target = "ROLE_" + role;
        return auth.getAuthorities().stream().anyMatch(a -> target.equals(a.getAuthority()));
    }
}
