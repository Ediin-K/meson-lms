package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectGroupService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectSubgroupRepository subjectSubgroupRepository;
    private final SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    private final SubjectSubgroupTeacherRepository subjectSubgroupTeacherRepository;
    private final DepartmentGroupRepository departmentGroupRepository;

    public List<SubjectGroupResponse> getBySubject(Long subjectId) {
        return toGroupResponses(subjectGroupRepository.findBySubjectId(subjectId));
    }

    /** Same groups as getBySubject, but for an arbitrary set of group ids, in that order. */
    public List<SubjectGroupResponse> getByIds(List<Long> groupIds) {
        if (groupIds.isEmpty()) {
            return List.of();
        }
        Map<Long, SubjectGroupResponse> byId = toGroupResponses(subjectGroupRepository.findAllById(groupIds))
                .stream()
                .collect(Collectors.toMap(SubjectGroupResponse::getId, r -> r));
        return groupIds.stream().map(byId::get).filter(java.util.Objects::nonNull).toList();
    }

    /**
     * Batched mapping for a list of groups: one query for all their teachers, one for all their
     * subgroups, one for all those subgroups' teachers — instead of firing that per group/subgroup.
     */
    private List<SubjectGroupResponse> toGroupResponses(List<SubjectGroup> groups) {
        if (groups.isEmpty()) {
            return List.of();
        }
        List<Long> groupIds = groups.stream().map(SubjectGroup::getId).toList();

        Map<Long, List<AssignedTeacherResponse>> teachersByGroup = subjectGroupTeacherRepository
                .findBySubjectGroupIdIn(groupIds).stream()
                .collect(Collectors.groupingBy(a -> a.getSubjectGroup().getId(), LinkedHashMap::new,
                        Collectors.mapping(this::toTeacherResponse, Collectors.toList())));

        List<SubjectSubgroup> subgroups = subjectSubgroupRepository.findBySubjectGroupIdIn(groupIds);
        Map<Long, List<SubjectSubgroup>> subgroupsByGroup = subgroups.stream()
                .collect(Collectors.groupingBy(sg -> sg.getSubjectGroup().getId(), LinkedHashMap::new,
                        Collectors.toList()));

        List<Long> subgroupIds = subgroups.stream().map(SubjectSubgroup::getId).toList();
        Map<Long, List<AssignedTeacherResponse>> assistantsBySubgroup = subgroupIds.isEmpty()
                ? Map.of()
                : subjectSubgroupTeacherRepository.findBySubjectSubgroupIdIn(subgroupIds).stream()
                        .collect(Collectors.groupingBy(a -> a.getSubjectSubgroup().getId(), LinkedHashMap::new,
                                Collectors.mapping(this::toTeacherResponse, Collectors.toList())));

        return groups.stream()
                .map(group -> SubjectGroupResponse.builder()
                        .id(group.getId())
                        .subjectId(group.getSubject().getId())
                        .name(group.getName())
                        .capacity(group.getCapacity())
                        .schedule(group.getSchedule())
                        .departmentGroupId(group.getDepartmentGroup() != null ? group.getDepartmentGroup().getId() : null)
                        .departmentGroupName(group.getDepartmentGroup() != null ? group.getDepartmentGroup().getName() : null)
                        .teachers(teachersByGroup.getOrDefault(group.getId(), List.of()))
                        .subgroups(subgroupsByGroup.getOrDefault(group.getId(), List.of()).stream()
                                .map(sg -> SubjectSubgroupResponse.builder()
                                        .id(sg.getId())
                                        .subjectGroupId(sg.getSubjectGroup().getId())
                                        .name(sg.getName())
                                        .capacity(sg.getCapacity())
                                        .schedule(sg.getSchedule())
                                        .assistants(assistantsBySubgroup.getOrDefault(sg.getId(), List.of()))
                                        .build())
                                .toList())
                        .build())
                .toList();
    }

    @Transactional
    public SubjectGroupResponse createGroup(Long subjectId, SubjectGroupRequest request) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Lënda nuk u gjet"));

        if (subjectGroupRepository.existsBySubjectIdAndNameIgnoreCase(subjectId, request.getName())) {
            throw new RuntimeException("Ky grup ekziston tashme per kete lende");
        }

        SubjectGroup group = SubjectGroup.builder()
                .subject(subject)
                .name(request.getName())
                .capacity(request.getCapacity())
                .schedule(request.getSchedule())
                .departmentGroup(resolveDepartmentGroup(subject, request.getDepartmentGroupId()))
                .build();

        SubjectGroup saved = subjectGroupRepository.save(group);
        syncGroupTeachers(saved, request.getTeacherIds());
        return toGroupResponse(saved);
    }

    @Transactional
    public SubjectGroupResponse updateGroup(Long groupId, SubjectGroupRequest request) {
        SubjectGroup group = subjectGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Grupi nuk u gjet"));

        group.setName(request.getName());
        group.setCapacity(request.getCapacity());
        group.setSchedule(request.getSchedule());
        group.setDepartmentGroup(resolveDepartmentGroup(group.getSubject(), request.getDepartmentGroupId()));
        SubjectGroup saved = subjectGroupRepository.save(group);
        syncGroupTeachers(saved, request.getTeacherIds());
        return toGroupResponse(saved);
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        if (!subjectGroupRepository.existsById(groupId)) {
            throw new RuntimeException("Grupi nuk u gjet");
        }
        subjectGroupRepository.deleteById(groupId);
    }

    @Transactional
    public SubjectSubgroupResponse createSubgroup(Long groupId, SubjectSubgroupRequest request) {
        SubjectGroup group = subjectGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Grupi nuk u gjet"));

        if (subjectSubgroupRepository.existsBySubjectGroupIdAndNameIgnoreCase(groupId, request.getName())) {
            throw new RuntimeException("Ky nengrup ekziston tashme per kete grup");
        }

        SubjectSubgroup subgroup = SubjectSubgroup.builder()
                .subjectGroup(group)
                .name(request.getName())
                .capacity(request.getCapacity())
                .schedule(request.getSchedule())
                .build();

        SubjectSubgroup saved = subjectSubgroupRepository.save(subgroup);
        syncSubgroupTeachers(saved, request.getAssistantIds());
        return toSubgroupResponse(saved);
    }

    @Transactional
    public SubjectSubgroupResponse updateSubgroup(Long subgroupId, SubjectSubgroupRequest request) {
        SubjectSubgroup subgroup = subjectSubgroupRepository.findById(subgroupId)
                .orElseThrow(() -> new RuntimeException("Nengrupi nuk u gjet"));

        subgroup.setName(request.getName());
        subgroup.setCapacity(request.getCapacity());
        subgroup.setSchedule(request.getSchedule());
        SubjectSubgroup saved = subjectSubgroupRepository.save(subgroup);
        syncSubgroupTeachers(saved, request.getAssistantIds());
        return toSubgroupResponse(saved);
    }

    @Transactional
    public void deleteSubgroup(Long subgroupId) {
        if (!subjectSubgroupRepository.existsById(subgroupId)) {
            throw new RuntimeException("Nengrupi nuk u gjet");
        }
        subjectSubgroupRepository.deleteById(subgroupId);
    }

    private void syncGroupTeachers(SubjectGroup group, List<Long> teacherIds) {
        subjectGroupTeacherRepository.deleteBySubjectGroupId(group.getId());
        if (teacherIds == null) return;

        for (Long teacherId : teacherIds) {
            User teacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Mesuesi nuk u gjet"));
            subjectGroupTeacherRepository.save(SubjectGroupTeacher.builder()
                    .subjectGroup(group)
                    .teacher(teacher)
                    .role("PROFESSOR")
                    .build());
        }
    }

    private void syncSubgroupTeachers(SubjectSubgroup subgroup, List<Long> assistantIds) {
        subjectSubgroupTeacherRepository.deleteBySubjectSubgroupId(subgroup.getId());
        if (assistantIds == null) return;

        for (Long assistantId : assistantIds) {
            User assistant = userRepository.findById(assistantId)
                    .orElseThrow(() -> new RuntimeException("Asistenti nuk u gjet"));
            subjectSubgroupTeacherRepository.save(SubjectSubgroupTeacher.builder()
                    .subjectSubgroup(subgroup)
                    .teacher(assistant)
                    .role("ASSISTANT")
                    .build());
        }
    }

    private DepartmentGroup resolveDepartmentGroup(Subject subject, Long departmentGroupId) {
        if (departmentGroupId == null) {
            return null;
        }
        DepartmentGroup departmentGroup = departmentGroupRepository.findById(departmentGroupId)
                .orElseThrow(() -> new RuntimeException("Grupi i departamentit nuk u gjet"));
        if (subject.getDepartment() == null
                || !subject.getDepartment().getId().equals(departmentGroup.getDepartment().getId())) {
            throw new RuntimeException("Grupi i departamentit nuk i perket departamentit te lendes");
        }
        return departmentGroup;
    }

    private SubjectGroupResponse toGroupResponse(SubjectGroup group) {
        return SubjectGroupResponse.builder()
                .id(group.getId())
                .subjectId(group.getSubject().getId())
                .name(group.getName())
                .capacity(group.getCapacity())
                .schedule(group.getSchedule())
                .departmentGroupId(group.getDepartmentGroup() != null ? group.getDepartmentGroup().getId() : null)
                .departmentGroupName(group.getDepartmentGroup() != null ? group.getDepartmentGroup().getName() : null)
                .teachers(subjectGroupTeacherRepository.findBySubjectGroupId(group.getId()).stream()
                        .map(this::toTeacherResponse)
                        .toList())
                .subgroups(subjectSubgroupRepository.findBySubjectGroupId(group.getId()).stream()
                        .map(this::toSubgroupResponse)
                        .toList())
                .build();
    }

    private SubjectSubgroupResponse toSubgroupResponse(SubjectSubgroup subgroup) {
        return SubjectSubgroupResponse.builder()
                .id(subgroup.getId())
                .subjectGroupId(subgroup.getSubjectGroup().getId())
                .name(subgroup.getName())
                .capacity(subgroup.getCapacity())
                .schedule(subgroup.getSchedule())
                .assistants(subjectSubgroupTeacherRepository.findBySubjectSubgroupId(subgroup.getId()).stream()
                        .map(this::toTeacherResponse)
                        .toList())
                .build();
    }

    private AssignedTeacherResponse toTeacherResponse(SubjectGroupTeacher assignment) {
        User teacher = assignment.getTeacher();
        return AssignedTeacherResponse.builder()
                .id(teacher.getId())
                .name(teacher.getEmri() + " " + teacher.getMbiemri())
                .email(teacher.getEmail())
                .role(assignment.getRole())
                .build();
    }

    private AssignedTeacherResponse toTeacherResponse(SubjectSubgroupTeacher assignment) {
        User teacher = assignment.getTeacher();
        return AssignedTeacherResponse.builder()
                .id(teacher.getId())
                .name(teacher.getEmri() + " " + teacher.getMbiemri())
                .email(teacher.getEmail())
                .role(assignment.getRole())
                .build();
    }
}
