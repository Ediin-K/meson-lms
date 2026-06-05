package com.meson.service;

import com.meson.dto.ScheduleSessionRequest;
import com.meson.dto.ScheduleSessionResponse;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleSessionService {

    private static final int DEFAULT_SESSION_MINUTES = 90;

    private final ScheduleSessionRepository scheduleSessionRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final SubjectSubgroupRepository subjectSubgroupRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ScheduleConflictValidator conflictValidator;

    @Transactional(readOnly = true)
    public List<ScheduleSessionResponse> getAll() {
        return scheduleSessionRepository.findAllWithDetails().stream()
                .map(this::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleSessionResponse> getForStudent(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserIdWithDetails(userId).orElse(null);

        if (profile == null || profile.getDepartment() == null || profile.getApprovedDepartmentGroup() == null) {
            return List.of();
        }

        return scheduleSessionRepository.findApprovedSchedulesForStudent(
                        profile.getDepartment().getId(),
                        profile.getCurrentSemester() != null ? profile.getCurrentSemester() : 1,
                        profile.getApprovedDepartmentGroup().getId())
                .stream()
                .map(this::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleSessionResponse> getForTeacher(Long teacherId) {
        return scheduleSessionRepository.findByTeacherIdWithDetails(teacherId).stream()
                .map(this::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public ScheduleSessionResponse create(ScheduleSessionRequest request) {
        throw new BadRequestException(
                "Oraret krijohen vetem brenda wizard-it te grupit. Shkoni te Menaxhimi i Grupeve.");
    }

    public ScheduleSessionResponse update(Long id, ScheduleSessionRequest request) {
        throw new BadRequestException(
                "Oraret perditesohen vetem brenda menaxhimit te grupit. Shkoni te Menaxhimi i Grupeve.");
    }

    public void delete(Long id) {
        if (!scheduleSessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Orari nuk u gjet");
        }
        scheduleSessionRepository.deleteById(id);
    }

    void validateSessionForWizard(ScheduleSession candidate, List<ScheduleSession> pending, Long excludeId) {
        if (candidate == null || candidate.getTeacher() == null) {
            throw new BadRequestException("Orari nuk eshte i vlefshem: mesuesi mungon");
        }
        if (candidate.getStartTime() == null || candidate.getEndTime() == null) {
            throw new BadRequestException("Orari nuk eshte i vlefshem: ora e fillimit ose mbarimit mungon");
        }
        conflictValidator.validateSession(candidate, pending, excludeId);
    }

    public ScheduleSessionResponse toResponse(ScheduleSession session) {
        if (session == null || session.getSubject() == null || session.getTeacher() == null) {
            return null;
        }

        User teacher = session.getTeacher();
        Subject course = session.getSubject();
        Department category = course.getDepartment();
        SubjectGroup courseGroup = session.getSubjectGroup();
        SubjectSubgroup subgroup = session.getSubjectSubgroup();

        String teacherName = trimJoin(teacher.getEmri(), teacher.getMbiemri());

        return ScheduleSessionResponse.builder()
                .id(session.getId())
                .subjectId(course.getId())
                .subjectTitle(course.getTitulli())
                .departmentId(category != null ? category.getId() : null)
                .departmentName(category != null ? category.getEmertimi() : null)
                .semester(course.getSemester())
                .subjectGroupId(courseGroup != null ? courseGroup.getId() : null)
                .subjectGroupName(courseGroup != null ? courseGroup.getName() : null)
                .subjectSubgroupId(subgroup != null ? subgroup.getId() : null)
                .subjectSubgroupName(subgroup != null ? subgroup.getName() : null)
                .teacherId(teacher.getId())
                .teacherName(teacherName.isEmpty() ? "—" : teacherName)
                .sessionType(session.getSessionType())
                .dayOfWeek(session.getDayOfWeek())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .room(session.getRoom())
                .color(session.getColor() != null ? session.getColor() : "sky")
                .capacity(session.getCapacity())
                .status(session.getStatus())
                .build();
    }

    private static String trimJoin(String first, String last) {
        String a = first != null ? first.trim() : "";
        String b = last != null ? last.trim() : "";
        return (a + " " + b).trim();
    }
}
