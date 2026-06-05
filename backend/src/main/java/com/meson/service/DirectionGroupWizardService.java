package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DirectionGroupWizardService {

    private static final int DEFAULT_SESSION_MINUTES = 90;
    private static final String ASSISTANT_SUBGROUP_NAME = "Ushtrime";

    private final DirectionGroupRepository directionGroupRepository;
    private final DirectionRepository directionRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectSubgroupRepository subjectSubgroupRepository;
    private final SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    private final SubjectSubgroupTeacherRepository subjectSubgroupTeacherRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;
    private final UserRepository userRepository;
    private final DirectionGroupService directionGroupService;
    private final SubjectGroupService subjectGroupService;
    private final ScheduleSessionService scheduleSessionService;
    private final TeacherService teacherService;
    private final ScheduleConflictValidator conflictValidator;

    @Transactional(readOnly = true)
    public DirectionGroupWizardContextResponse getContext(Long categoryId, Integer semester) {
        Direction category = directionRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kategoria nuk u gjet"));

        List<Subject> subjects = subjectRepository.findByDirectionIdAndSemester(categoryId, semester);

        return DirectionGroupWizardContextResponse.builder()
                .categoryId(category.getId())
                .categoryName(category.getEmertimi())
                .semester(semester)
                .subjects(subjects.stream().map(this::toSubjectResponse).toList())
                .teachers(teacherService.getAllTeachers())
                .build();
    }

    @Transactional
    public DirectionGroupWizardResponse createGroupWithSchedule(CreateDirectionGroupWizardRequest request) {
        Direction category = directionRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategoria nuk u gjet"));

        if (directionGroupRepository.existsByDirectionIdAndSemesterAndNameIgnoreCase(
                request.getCategoryId(), request.getSemester(), request.getName())) {
            throw new BadRequestException("Ky grup ekziston tashme per kete drejtim dhe semestrin");
        }

        DirectionGroup directionGroup = directionGroupRepository.save(DirectionGroup.builder()
                .direction(category)
                .semester(request.getSemester())
                .name(request.getName().trim())
                .description(trimToNull(request.getDescription()))
                .maxCapacity(request.getMaxCapacity())
                .status(DirectionGroupStatus.ACTIVE)
                .build());

        Map<Long, SubjectGroup> subjectGroupBySubjectId = new LinkedHashMap<>();

        for (GroupStaffAssignmentRequest staff : request.getStaff()) {
            Subject subject = resolveSubjectForContext(staff.getSubjectId(), request.getCategoryId(), request.getSemester());
            validateTeacher(staff.getProfessorId());
            if (staff.getAssistantId() != null) {
                validateTeacher(staff.getAssistantId());
            }

            SubjectGroup subjectGroup = subjectGroupBySubjectId.computeIfAbsent(subject.getId(), cid -> {
                if (subjectGroupRepository.existsBySubjectIdAndNameIgnoreCase(cid, request.getName())) {
                    throw new BadRequestException(
                            "Ekziston tashme nje grup Lënda me emrin '" + request.getName() + "' per lenden "
                                    + subject.getTitulli());
                }
                return subjectGroupRepository.save(SubjectGroup.builder()
                        .subject(subject)
                        .name(request.getName())
                        .capacity(request.getMaxCapacity())
                        .directionGroup(directionGroup)
                        .build());
            });

            syncProfessor(subjectGroup, staff.getProfessorId());
            if (staff.getAssistantId() != null) {
                syncAssistantSubgroup(subjectGroup, staff.getAssistantId());
            }
        }

        Set<Long> staffSubjectIds = new HashSet<>();
        for (GroupStaffAssignmentRequest staff : request.getStaff()) {
            staffSubjectIds.add(staff.getSubjectId());
        }

        List<ScheduleSession> pending = new ArrayList<>();
        List<ScheduleSession> savedSessions = new ArrayList<>();

        for (GroupScheduleEntryRequest entry : request.getSchedules()) {
            if (!staffSubjectIds.contains(entry.getSubjectId())) {
                throw new BadRequestException(
                        "Lenda e orarit duhet te kete staf te caktuar ne seksionin e stafit akademik");
            }

            Subject subject = resolveSubjectForContext(entry.getSubjectId(), request.getCategoryId(), request.getSemester());
            SubjectGroup subjectGroup = subjectGroupBySubjectId.get(subject.getId());
            if (subjectGroup == null) {
                throw new BadRequestException("Grupi i lendes nuk u gjet per orarin: " + subject.getTitulli());
            }

            validateTeacher(entry.getProfessorId());
            if (entry.getAssistantId() != null) {
                validateTeacher(entry.getAssistantId());
            }

            LocalTime endTime = entry.getEndTime() != null
                    ? entry.getEndTime()
                    : entry.getStartTime().plusMinutes(DEFAULT_SESSION_MINUTES);

            Long sessionTeacherId = entry.getSessionType() == ScheduleSessionType.EXERCISE
                    && entry.getAssistantId() != null
                    ? entry.getAssistantId()
                    : entry.getProfessorId();

            User teacher = userRepository.findById(sessionTeacherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Mesuesi nuk u gjet"));

            ScheduleSession session = ScheduleSession.builder()
                    .subject(subject)
                    .subjectGroup(subjectGroup)
                    .teacher(teacher)
                    .sessionType(entry.getSessionType())
                    .dayOfWeek(entry.getDayOfWeek())
                    .startTime(entry.getStartTime())
                    .endTime(endTime)
                    .room(entry.getRoom())
                    .color(normalizeColorToken(entry.getColor()))
                    .capacity(request.getMaxCapacity())
                    .status("ACTIVE")
                    .build();

            conflictValidator.validateSessionWithAssistant(
                    session, entry.getAssistantId(), pending, null);

            pending.add(session);
            savedSessions.add(scheduleSessionRepository.save(session));
        }

        List<SubjectGroupResponse> subjectGroupResponses = new ArrayList<>();
        for (SubjectGroup cg : subjectGroupBySubjectId.values()) {
            subjectGroupResponses.add(subjectGroupService.getBySubject(cg.getSubject().getId()).stream()
                    .filter(g -> Objects.equals(g.getId(), cg.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Grupi i Lëndat nuk u gjet")));
        }

        return DirectionGroupWizardResponse.builder()
                .group(directionGroupService.toResponse(directionGroup))
                .subjectGroups(subjectGroupResponses)
                .schedules(savedSessions.stream()
                        .map(scheduleSessionService::toResponse)
                        .filter(Objects::nonNull)
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public DirectionGroupWizardResponse getGroupDetail(Long directionGroupId) {
        DirectionGroup group = directionGroupService.getEntity(directionGroupId);
        List<ScheduleSessionResponse> schedules = scheduleSessionRepository
                .findByDirectionGroupIdAndSemester(group.getId(), group.getSemester())
                .stream()
                .map(scheduleSessionService::toResponse)
                .filter(Objects::nonNull)
                .toList();

        List<SubjectGroupResponse> subjectGroups = subjectGroupRepository
                .findByDirectionGroupId(group.getId())
                .stream()
                .map(cg -> subjectGroupService.getBySubject(cg.getSubject().getId()).stream()
                        .filter(g -> Objects.equals(g.getId(), cg.getId()))
                        .findFirst()
                        .orElse(null))
                .filter(Objects::nonNull)
                .toList();

        return DirectionGroupWizardResponse.builder()
                .group(directionGroupService.toResponse(group))
                .subjectGroups(subjectGroups)
                .schedules(schedules)
                .build();
    }

    private Subject resolveSubjectForContext(Long subjectId, Long categoryId, Integer semester) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Lenda nuk u gjet"));
        if (subject.getDirection() == null
                || !subject.getDirection().getId().equals(categoryId)) {
            throw new BadRequestException("Lenda nuk i perket drejtimit te zgjedhur");
        }
        if (subject.getSemester() == null || !semester.equals(subject.getSemester())) {
            throw new BadRequestException("Lenda nuk i perket semestrit te zgjedhur");
        }
        return subject;
    }

    private void validateTeacher(Long teacherId) {
        userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesuesi nuk u gjet"));
    }

    private void syncProfessor(SubjectGroup group, Long professorId) {
        if (group == null || group.getId() == null || professorId == null) {
            throw new BadRequestException("Grupi ose profesori mungon");
        }
        if (!subjectGroupTeacherRepository.existsBySubjectGroupIdAndTeacherId(group.getId(), professorId)) {
            User teacher = userRepository.findById(professorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Profesori nuk u gjet"));
            subjectGroupTeacherRepository.save(SubjectGroupTeacher.builder()
                    .subjectGroup(group)
                    .teacher(teacher)
                    .role("PROFESSOR")
                    .build());
        }
    }

    private void syncAssistantSubgroup(SubjectGroup group, Long assistantId) {
        SubjectSubgroup subgroup = subjectSubgroupRepository
                .findBySubjectGroupId(group.getId())
                .stream()
                .filter(s -> ASSISTANT_SUBGROUP_NAME.equalsIgnoreCase(s.getName()))
                .findFirst()
                .orElseGet(() -> subjectSubgroupRepository.save(SubjectSubgroup.builder()
                        .subjectGroup(group)
                        .name(ASSISTANT_SUBGROUP_NAME)
                        .capacity(group.getCapacity())
                        .build()));

        boolean exists = subjectSubgroupTeacherRepository.findBySubjectSubgroupId(subgroup.getId()).stream()
                .anyMatch(t -> t.getTeacher() != null && Objects.equals(t.getTeacher().getId(), assistantId));
        if (!exists) {
            User assistant = userRepository.findById(assistantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Asistenti nuk u gjet"));
            subjectSubgroupTeacherRepository.save(SubjectSubgroupTeacher.builder()
                    .subjectSubgroup(subgroup)
                    .teacher(assistant)
                    .role("ASSISTANT")
                    .build());
        }
    }

    private SubjectResponse toSubjectResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .titulli(subject.getTitulli())
                .semester(subject.getSemester())
                .categoryId(subject.getDirection() != null ? subject.getDirection().getId() : null)
                .categoryName(subject.getDirection() != null ? subject.getDirection().getEmertimi() : null)
                .build();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeColorToken(String color) {
        if (color == null || color.isBlank()) {
            return "sky";
        }
        String normalized = color.trim().toLowerCase(Locale.ROOT);
        return Set.of("sky", "emerald", "violet", "amber", "rose", "slate").contains(normalized)
                ? normalized
                : "sky";
    }
}
