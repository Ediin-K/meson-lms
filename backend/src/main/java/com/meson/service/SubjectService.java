package com.meson.service;

import com.meson.dto.SubjectResponse;
import com.meson.dto.SubjectRequest;
import com.meson.entity.Subject;
import com.meson.entity.SubjectTeacher;
import com.meson.entity.User;
import com.meson.entity.Department;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.SubjectRepository;
import com.meson.repository.SubjectTeacherRepository;
import com.meson.repository.SubjectGroupRepository;
import com.meson.repository.SubjectGroupTeacherRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.ModuleRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.ScheduleSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectTeacherRepository subjectTeacherRepository;
    private final SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ModuleRepository moduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;
    private final SecurityAccessService securityAccessService;

    public List<SubjectResponse> getAll() {
        return toResponses(subjectRepository.findAll());
    }

    public SubjectResponse getById(Long id) {
        return toResponse(subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lënda nuk u gjet")));
    }

    @Transactional
    public SubjectResponse create(SubjectRequest request) {
        if (subjectRepository.existsByTitulli(request.getTitulli())) {
            throw new RuntimeException("Lënda tashmë ekziston");
        }

        List<User> teachers = resolveTeachers(request);
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamenti nuk u gjet"));

        Subject subject = new Subject();
        subject.setTitulli(request.getTitulli());
        subject.setCode(normalizeCode(request.getCode()));
        subject.setPershkrimi(request.getPershkrimi());
        subject.setEcts(request.getEcts() != null ? request.getEcts() : 5);
        subject.setStatusi(request.getStatusi());
        subject.setTeacher(teachers.get(0));
        subject.setDepartment(department);
        subject.setSemester(request.getSemester());
        subject.setEnrollmentKey(normalizeEnrollmentKey(request.getEnrollmentKey()));
        subject = subjectRepository.save(subject);

        syncTeacherPool(subject, teachers);
        return toResponse(subject);
    }

    @Transactional
    public SubjectResponse update(Long id, SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lënda nuk u gjet"));
        assertCanManageDepartment(subject.getDepartment().getId());

        List<User> teachers = resolveTeachers(request);
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamenti nuk u gjet"));
        assertCanManageDepartment(department.getId());

        // A teacher can't be dropped from the pool while still assigned to one of this subject's groups.
        Set<Long> keptIds = teachers.stream().map(User::getId).collect(java.util.stream.Collectors.toSet());
        for (SubjectTeacher existing : subjectTeacherRepository.findBySubjectIdOrderBySortOrder(id)) {
            Long tid = existing.getTeacher().getId();
            if (!keptIds.contains(tid) && teachesAnyGroup(id, tid)) {
                throw new BadRequestException(
                        "Mesuesi " + existing.getTeacher().getEmri() + " ka ende grup ne kete lende. "
                                + "Hiqeni nga grupi para se ta hiqni nga lenda.");
            }
        }

        subject.setTitulli(request.getTitulli());
        subject.setCode(normalizeCode(request.getCode()));
        subject.setPershkrimi(request.getPershkrimi());
        subject.setEcts(request.getEcts() != null ? request.getEcts() : 5);
        subject.setStatusi(request.getStatusi());
        subject.setTeacher(teachers.get(0));
        subject.setDepartment(department);
        subject.setSemester(request.getSemester());
        subject.setEnrollmentKey(normalizeEnrollmentKey(request.getEnrollmentKey()));
        subject = subjectRepository.save(subject);

        syncTeacherPool(subject, teachers);
        return toResponse(subject);
    }

    @Transactional
    public void delete(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lënda nuk u gjet"));
        assertCanManageDepartment(subject.getDepartment().getId());
        if (moduleRepository.countBySubjectId(id) > 0) {
            throw new RuntimeException("Kjo lëndë ka module. Fshijini modulet para se të fshini lëndën.");
        }
        if (enrollmentRepository.countBySubjectId(id) > 0) {
            throw new RuntimeException("Kjo lëndë ka studentë të regjistruar. Hiqni regjistrimet para se të fshini lëndën.");
        }
        if (subjectGroupRepository.countBySubjectId(id) > 0) {
            throw new RuntimeException("Kjo lëndë ka grupe. Fshini grupet para se të fshini lëndën.");
        }
        if (scheduleSessionRepository.countBySubjectId(id) > 0) {
            throw new RuntimeException("Kjo lëndë ka orë të planifikuara. Fshini oraret para se të fshini lëndën.");
        }
        subjectRepository.deleteById(id); // subject_teachers cascade via Subject.teachers
    }

    // ── teacher pool ───────────────────────────────────────────────────

    private List<User> resolveTeachers(SubjectRequest request) {
        List<Long> ids = new ArrayList<>();
        if (request.getTeacherIds() != null && !request.getTeacherIds().isEmpty()) {
            ids.addAll(new LinkedHashSet<>(request.getTeacherIds()));
        } else if (request.getTeacherId() != null) {
            ids.add(request.getTeacherId());
        }
        if (ids.isEmpty()) {
            throw new BadRequestException("Zgjidhni të paktën një mësues për lëndën.");
        }
        List<User> teachers = new ArrayList<>();
        for (Long tid : ids) {
            teachers.add(userRepository.findById(tid)
                    .orElseThrow(() -> new ResourceNotFoundException("Mesuesi nuk u gjet: " + tid)));
        }
        return teachers;
    }

    private void syncTeacherPool(Subject subject, List<User> teachers) {
        List<SubjectTeacher> existing = subjectTeacherRepository.findBySubjectIdOrderBySortOrder(subject.getId());
        Set<Long> wanted = teachers.stream().map(User::getId).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));

        subjectTeacherRepository.deleteAll(existing.stream()
                .filter(st -> !wanted.contains(st.getTeacher().getId()))
                .toList());

        java.util.Map<Long, SubjectTeacher> byTeacher = new java.util.HashMap<>();
        existing.forEach(st -> byTeacher.put(st.getTeacher().getId(), st));

        int order = 0;
        for (User teacher : teachers) {
            SubjectTeacher row = byTeacher.get(teacher.getId());
            if (row == null) {
                row = SubjectTeacher.builder().subject(subject).teacher(teacher).sortOrder(order).build();
            } else {
                row.setSortOrder(order);
            }
            subjectTeacherRepository.save(row);
            order++;
        }
    }

    private boolean teachesAnyGroup(Long subjectId, Long teacherId) {
        return subjectGroupRepository.findBySubjectId(subjectId).stream()
                .anyMatch(g -> subjectGroupTeacherRepository.existsBySubjectGroupIdAndTeacherId(g.getId(), teacherId));
    }

    // ── response ───────────────────────────────────────────────────────

    /** Batched: one teacher-pool query for many subjects instead of N+1. */
    private List<SubjectResponse> toResponses(List<Subject> subjects) {
        if (subjects.isEmpty()) {
            return List.of();
        }
        List<Long> ids = subjects.stream().map(Subject::getId).toList();
        java.util.Map<Long, List<SubjectResponse.TeacherRef>> poolBySubject = new java.util.LinkedHashMap<>();
        subjectTeacherRepository.findBySubjectIdInOrderBySubjectIdAscSortOrderAsc(ids).forEach(st ->
                poolBySubject.computeIfAbsent(st.getSubject().getId(), k -> new ArrayList<>())
                        .add(SubjectResponse.TeacherRef.builder()
                                .id(st.getTeacher().getId())
                                .name(st.getTeacher().getEmri() + " " + st.getTeacher().getMbiemri())
                                .build()));
        return subjects.stream()
                .map(s -> toResponse(s, poolBySubject.getOrDefault(s.getId(), List.of())))
                .toList();
    }

    private SubjectResponse toResponse(Subject subject) {
        return toResponse(subject, subjectTeacherRepository
                .findBySubjectIdOrderBySortOrder(subject.getId()).stream()
                .map(st -> SubjectResponse.TeacherRef.builder()
                        .id(st.getTeacher().getId())
                        .name(st.getTeacher().getEmri() + " " + st.getTeacher().getMbiemri())
                        .build())
                .toList());
    }

    private SubjectResponse toResponse(Subject subject, List<SubjectResponse.TeacherRef> pool) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .titulli(subject.getTitulli())
                .code(subject.getCode())
                .pershkrimi(subject.getPershkrimi())
                .teacherId(subject.getTeacher().getId())
                .teacherName(subject.getTeacher().getEmri())
                .teachers(pool)
                .departmentId(subject.getDepartment().getId())
                .departmentName(subject.getDepartment().getEmertimi())
                .semester(subject.getSemester())
                .enrollmentKey(subject.getEnrollmentKey())
                .ects(subject.getEcts())
                .statusi(subject.getStatusi())
                .createdAt(subject.getCreatedAt())
                .build();
    }

    public List<SubjectResponse> getByDepartmentAndSemester(Long departmentId, Integer semester) {
        return toResponses(subjectRepository.findByDepartmentIdAndSemester(departmentId, semester));
    }

    public List<SubjectResponse> getByDepartmentId(Long departmentId) {
        return toResponses(subjectRepository.findByDepartmentId(departmentId));
    }

    public List<SubjectResponse> getBySemester(Integer semester) {
        return toResponses(subjectRepository.findBySemester(semester));
    }

    /** ADMIN bypasses; DEPARTMENT_HEAD only allowed on their own department. */
    private void assertCanManageDepartment(Long departmentId) {
        if (!securityAccessService.canManageDepartment(departmentId)) {
            throw new org.springframework.security.access.AccessDeniedException("Nuk keni qasje ne kete departament");
        }
    }

    private String normalizeEnrollmentKey(String enrollmentKey) {
        if (!StringUtils.hasText(enrollmentKey)) {
            throw new BadRequestException("Kodi i regjistrimit është i detyrueshëm.");
        }
        return enrollmentKey.trim();
    }

    private String normalizeCode(String code) {
        return StringUtils.hasText(code) ? code.trim() : null;
    }
}
