package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.Department;
import com.meson.entity.DepartmentGroup;
import com.meson.entity.DepartmentGroupStatus;
import com.meson.entity.StudentProfile;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.DepartmentGroupRepository;
import com.meson.repository.StudentProfileRepository;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentGroupService {

    private final DepartmentGroupRepository departmentGroupRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Transactional(readOnly = true)
    public List<DepartmentGroupResponse> getByDepartment(Long departmentId, Integer semester) {
        List<DepartmentGroup> groups = semester != null
                ? departmentGroupRepository.findByDepartmentIdAndSemesterWithDepartment(departmentId, semester)
                : departmentGroupRepository.findByDepartmentIdWithDepartment(departmentId);
        return groups.stream().map(this::toResponse).toList();
    }

    @Transactional
    public DepartmentGroupResponse create(Long departmentId, DepartmentGroupRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Departamenti nuk u gjet"));

        validateRequest(request);
        int semester = request.getSemester();

        if (departmentGroupRepository.existsByDepartmentIdAndSemesterAndNameIgnoreCase(
                departmentId, semester, request.getName())) {
            throw new BadRequestException("Ky grup ekziston tashme per kete departament dhe semestrin");
        }

        DepartmentGroup group = DepartmentGroup.builder()
                .department(department)
                .semester(semester)
                .name(request.getName().trim())
                .description(trimToNull(request.getDescription()))
                .maxCapacity(request.getMaxCapacity())
                .status(resolveStoredStatus(request.getStatus()))
                .build();

        return toResponse(departmentGroupRepository.save(group));
    }

    @Transactional
    public DepartmentGroupResponse update(Long groupId, DepartmentGroupRequest request) {
        DepartmentGroup group = departmentGroupRepository.findByIdWithDepartment(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Grupi i departamentit nuk u gjet"));

        validateRequest(request);
        Long departmentId = group.getDepartment().getId();
        int semester = request.getSemester() != null ? request.getSemester() : group.getSemester();

        if (!group.getName().equalsIgnoreCase(request.getName())
                && departmentGroupRepository.existsByDepartmentIdAndSemesterAndNameIgnoreCase(
                        departmentId, semester, request.getName())) {
            throw new BadRequestException("Ky grup ekziston tashme per kete departament dhe semestrin");
        }

        if (request.getMaxCapacity() < getCurrentStudents(groupId)) {
            throw new BadRequestException("Kapaciteti nuk mund te jete me i vogel se numri aktual i studenteve");
        }

        group.setSemester(semester);
        group.setName(request.getName().trim());
        group.setDescription(trimToNull(request.getDescription()));
        group.setMaxCapacity(request.getMaxCapacity());
        if (request.getStatus() != null) {
            group.setStatus(resolveStoredStatus(request.getStatus()));
        }
        return toResponse(departmentGroupRepository.save(group));
    }

    @Transactional
    public void delete(Long groupId) {
        if (getCurrentStudents(groupId) > 0) {
            throw new BadRequestException("Grupi ka studente te aprovuar dhe nuk mund te fshihet");
        }
        departmentGroupRepository.deleteById(groupId);
    }

    @Transactional(readOnly = true)
    public DepartmentGroup getEntity(Long groupId) {
        return departmentGroupRepository.findByIdWithDepartment(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Grupi i departamentit nuk u gjet"));
    }

    public int getCurrentStudents(Long departmentGroupId) {
        return (int) studentProfileRepository.countByApprovedDepartmentGroupId(departmentGroupId);
    }

    public void assertGroupAcceptsStudents(DepartmentGroup group) {
        if (group.getStatus() == DepartmentGroupStatus.CLOSED) {
            throw new BadRequestException("Grupi eshte i mbyllur");
        }
        DepartmentGroupResponse info = toResponse(group);
        if (Boolean.TRUE.equals(info.getIsFull())) {
            throw new BadRequestException("Grupi eshte plote");
        }
    }

    public List<StudentGroupMemberResponse> getMembers(Long groupId) {
        getEntity(groupId);
        return studentProfileRepository.findMembersByDepartmentGroupId(groupId).stream()
                .map(this::toMemberResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public DepartmentGroupResponse toResponse(DepartmentGroup group) {
        if (group == null) {
            return null;
        }
        int current = getCurrentStudents(group.getId());
        int max = group.getMaxCapacity() != null ? group.getMaxCapacity() : 0;
        int remaining = Math.max(0, max - current);
        boolean isFull = max > 0 && current >= max;
        Department department = group.getDepartment();

        return DepartmentGroupResponse.builder()
                .id(group.getId())
                .departmentId(department != null ? department.getId() : null)
                .departmentName(department != null ? department.getEmertimi() : null)
                .semester(group.getSemester())
                .name(group.getName())
                .description(group.getDescription())
                .maxCapacity(max)
                .currentStudents(current)
                .remainingSeats(remaining)
                .isFull(isFull)
                .status(computeDisplayStatus(group.getStatus(), isFull))
                .build();
    }

    private StudentGroupMemberResponse toMemberResponse(StudentProfile profile) {
        if (profile == null || profile.getUser() == null) {
            return null;
        }
        var user = profile.getUser();
        return StudentGroupMemberResponse.builder()
                .userId(user.getId())
                .firstName(user.getEmri())
                .lastName(user.getMbiemri())
                .email(user.getEmail())
                .currentSemester(profile.getCurrentSemester())
                .build();
    }

    private void validateRequest(DepartmentGroupRequest request) {
        if (request.getSemester() == null || request.getSemester() < 1 || request.getSemester() > 12) {
            throw new BadRequestException("Semestri duhet te jete midis 1 dhe 12");
        }
        if (request.getMaxCapacity() == null || request.getMaxCapacity() < 1) {
            throw new BadRequestException("Kapaciteti duhet te jete te pakten 1");
        }
    }

    private DepartmentGroupStatus resolveStoredStatus(DepartmentGroupStatus status) {
        return status == DepartmentGroupStatus.CLOSED ? DepartmentGroupStatus.CLOSED : DepartmentGroupStatus.ACTIVE;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String computeDisplayStatus(DepartmentGroupStatus stored, boolean isFull) {
        if (stored == DepartmentGroupStatus.CLOSED) {
            return "CLOSED";
        }
        if (isFull) {
            return "FULL";
        }
        return "ACTIVE";
    }
}
