package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentGroupRequestService {

    private final StudentGroupRequestRepository studentGroupRequestRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final DepartmentGroupRepository departmentGroupRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final DepartmentGroupService departmentGroupService;
    private final UserRepository userRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;
    private final ScheduleSessionService scheduleSessionService;
    private final StudentGroupSelectionRepository studentGroupSelectionRepository;

    @Transactional(readOnly = true)
    public StudentScheduleOverviewResponse getScheduleOverview(Long userId) {
        StudentGroupStatusResponse status = buildStudentStatus(userId);
        List<ScheduleSessionResponse> approvedSchedules = List.of();
        List<AvailableDepartmentGroupResponse> availableGroups = List.of();

        if (status.isHasApprovedGroup() && status.getApprovedGroup() != null) {
            approvedSchedules = loadApprovedSchedules(userId, status.getApprovedGroup().getId());
        } else if (status.isDepartmentAssigned()) {
            availableGroups = buildAvailableGroups(userId, status);
        }

        return StudentScheduleOverviewResponse.builder()
                .status(status)
                .availableGroups(availableGroups)
                .approvedSchedules(approvedSchedules)
                .build();
    }

    @Transactional(readOnly = true)
    public StudentGroupStatusResponse getStudentStatus(Long userId) {
        return buildStudentStatus(userId);
    }

    @Transactional(readOnly = true)
    public List<AvailableDepartmentGroupResponse> getAvailableGroups(Long userId) {
        StudentGroupStatusResponse status = buildStudentStatus(userId);
        if (!status.isDepartmentAssigned() || status.isHasApprovedGroup()) {
            return List.of();
        }
        return buildAvailableGroups(userId, status);
    }

    @Transactional
    public StudentGroupRequestResponse apply(Long userId, ApplyGroupRequest request) {
        StudentProfile profile = requireStudentProfile(userId);
        validateStudentDepartment(profile);

        if (profile.getApprovedDepartmentGroup() != null) {
            throw new RuntimeException("Ke tashme nje grup te aprovuar");
        }

        if (studentGroupRequestRepository.existsByStudentIdAndStatus(userId, GroupRequestStatus.PENDING)) {
            throw new RuntimeException("Ke nje aplikim ne pritje");
        }

        DepartmentGroup group = departmentGroupService.getEntity(request.getDepartmentGroupId());
        validateGroupMatchesStudent(profile, group);
        departmentGroupService.assertGroupAcceptsStudents(group);

        User student = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Studenti nuk u gjet"));

        StudentGroupRequest application = StudentGroupRequest.builder()
                .student(student)
                .departmentGroup(group)
                .status(GroupRequestStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        return toResponse(studentGroupRequestRepository.save(application));
    }

    @Transactional
    public DepartmentGroupResponse selectGroup(Long userId, ApplyGroupRequest request) {
        StudentProfile profile = requireStudentProfile(userId);
        validateStudentDepartment(profile);

        if (profile.getApprovedDepartmentGroup() != null || studentGroupSelectionRepository.existsByStudentId(userId)) {
            throw new BadRequestException("Ke zgjedhur tashme nje grup");
        }

        DepartmentGroup group = departmentGroupService.getEntity(request.getDepartmentGroupId());
        validateGroupMatchesStudent(profile, group);
        departmentGroupService.assertGroupAcceptsStudents(group);

        User student = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Studenti nuk u gjet"));

        rejectPendingApplications(userId, null);
        profile.setApprovedDepartmentGroup(group);
        studentProfileRepository.save(profile);

        studentGroupSelectionRepository.save(StudentGroupSelection.builder()
                .student(student)
                .departmentGroup(group)
                .selectedAt(LocalDateTime.now())
                .build());

        return departmentGroupService.toResponse(group);
    }

    @Transactional
    public StudentGroupRequestResponse approve(Long requestId, Long adminUserId) {
        StudentGroupRequest request = getRequest(requestId);
        if (request.getStatus() != GroupRequestStatus.PENDING) {
            throw new RuntimeException("Vetem aplikimet ne pritje mund te aprovohen");
        }

        DepartmentGroup group = request.getDepartmentGroup();
        departmentGroupService.assertGroupAcceptsStudents(group);

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admini nuk u gjet"));

        StudentProfile profile = studentProfileRepository.findByUserId(request.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Profili i studentit nuk u gjet"));

        assignStudentToGroup(profile, group, admin);

        request.setStatus(GroupRequestStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovedBy(admin);

        return toResponse(studentGroupRequestRepository.save(request));
    }

    @Transactional
    public StudentGroupRequestResponse reject(Long requestId, Long adminUserId) {
        StudentGroupRequest request = getRequest(requestId);
        if (request.getStatus() != GroupRequestStatus.PENDING) {
            throw new RuntimeException("Vetem aplikimet ne pritje mund te refuzohen");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admini nuk u gjet"));

        request.setStatus(GroupRequestStatus.REJECTED);
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovedBy(admin);

        return toResponse(studentGroupRequestRepository.save(request));
    }

    @Transactional
    public DepartmentGroupResponse adminAssignStudent(Long userId, AssignStudentGroupRequest request, Long adminUserId) {
        StudentProfile profile = requireStudentProfile(userId);
        validateStudentDepartment(profile);

        if (profile.getApprovedDepartmentGroup() != null) {
            throw new RuntimeException("Studenti ka tashme nje grup te aprovuar");
        }

        DepartmentGroup group = departmentGroupService.getEntity(request.getDepartmentGroupId());
        validateGroupMatchesStudent(profile, group);
        departmentGroupService.assertGroupAcceptsStudents(group);

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admini nuk u gjet"));

        rejectPendingApplications(userId, admin);
        assignStudentToGroup(profile, group, admin);

        return departmentGroupService.toResponse(group);
    }

    @Transactional
    public void adminRemoveStudent(Long userId) {
        StudentProfile profile = requireStudentProfile(userId);
        if (profile.getApprovedDepartmentGroup() == null) {
            throw new RuntimeException("Studenti nuk eshte ne asnje grup");
        }
        profile.setApprovedDepartmentGroup(null);
        studentProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public List<StudentGroupRequestResponse> getAdminRequests(
            GroupRequestStatus status, Long departmentId, Long departmentGroupId) {
        return studentGroupRequestRepository.findAdminRequests(status, departmentId, departmentGroupId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void assignStudentToGroup(StudentProfile profile, DepartmentGroup group, User admin) {
        if (profile.getApprovedDepartmentGroup() != null) {
            throw new RuntimeException("Studenti ka tashme nje grup te aprovuar");
        }
        departmentGroupService.assertGroupAcceptsStudents(group);
        validateGroupMatchesStudent(profile, group);

        profile.setApprovedDepartmentGroup(group);
        studentProfileRepository.save(profile);
    }

    private void rejectPendingApplications(Long userId, User admin) {
        studentGroupRequestRepository
                .findByStudentIdAndStatus(userId, GroupRequestStatus.PENDING)
                .ifPresent(pending -> {
                    pending.setStatus(GroupRequestStatus.REJECTED);
                    pending.setApprovedAt(LocalDateTime.now());
                    if (admin != null) {
                        pending.setApprovedBy(admin);
                    }
                    studentGroupRequestRepository.save(pending);
                });
    }

    private void validateGroupMatchesStudent(StudentProfile profile, DepartmentGroup group) {
        if (!group.getDepartment().getId().equals(profile.getDepartment().getId())) {
            throw new RuntimeException("Ky grup nuk i perket departamentit tend");
        }
        int studentSemester = profile.getCurrentSemester() != null ? profile.getCurrentSemester() : 1;
        if (!group.getSemester().equals(studentSemester)) {
            throw new RuntimeException("Ky grup nuk i perket semestrit tend");
        }
    }

    private StudentGroupStatusResponse buildStudentStatus(Long userId) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserIdWithDetails(userId);

        if (profileOpt.isEmpty()) {
            return StudentGroupStatusResponse.builder()
                    .hasApprovedGroup(false)
                    .departmentAssigned(false)
                    .build();
        }

        StudentProfile profile = profileOpt.get();
        Department department = profile.getDepartment();

        DepartmentGroupResponse approved = null;
        if (profile.getApprovedDepartmentGroup() != null) {
            approved = departmentGroupService.toResponse(profile.getApprovedDepartmentGroup());
        }

        StudentGroupRequestResponse pending = studentGroupRequestRepository
                .findByStudentIdAndStatus(userId, GroupRequestStatus.PENDING)
                .map(this::toResponse)
                .orElse(null);

        return StudentGroupStatusResponse.builder()
                .hasApprovedGroup(approved != null)
                .departmentAssigned(department != null)
                .departmentId(department != null ? department.getId() : null)
                .departmentName(department != null ? department.getEmertimi() : null)
                .currentSemester(profile.getCurrentSemester())
                .approvedGroup(approved)
                .pendingRequest(pending)
                .build();
    }

    private List<AvailableDepartmentGroupResponse> buildAvailableGroups(
            Long userId, StudentGroupStatusResponse status) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserIdWithDetails(userId);
        if (profileOpt.isEmpty() || profileOpt.get().getDepartment() == null) {
            return List.of();
        }

        StudentProfile profile = profileOpt.get();
        Long departmentId = profile.getDepartment().getId();
        Integer semester = profile.getCurrentSemester() != null ? profile.getCurrentSemester() : 1;

        boolean hasPending = status.getPendingRequest() != null;
        List<DepartmentGroup> departmentGroups = resolveDepartmentGroupsForDepartment(departmentId, semester);

        List<AvailableDepartmentGroupResponse> result = new ArrayList<>();
        for (DepartmentGroup group : departmentGroups) {
            result.add(buildAvailableGroupEntry(group, semester, false, hasPending));
        }
        return result;
    }

    private List<DepartmentGroup> resolveDepartmentGroupsForDepartment(Long departmentId, Integer semester) {
        List<DepartmentGroup> groups =
                departmentGroupRepository.findByDepartmentIdAndSemesterWithDepartment(departmentId, semester);
        if (!groups.isEmpty()) {
            return groups;
        }

        List<DepartmentGroup> linked =
                subjectGroupRepository.findDistinctDepartmentGroupsByDepartmentId(departmentId);
        return linked.stream()
                .filter(g -> semester.equals(g.getSemester()))
                .toList();
    }

    private AvailableDepartmentGroupResponse buildAvailableGroupEntry(
            DepartmentGroup group, Integer semester, boolean hasApproved, boolean hasPending) {
        DepartmentGroupResponse groupInfo = departmentGroupService.toResponse(group);
        List<ScheduleSessionResponse> schedules = scheduleSessionRepository
                .findByDepartmentGroupIdAndSemester(group.getId(), semester)
                .stream()
                .map(scheduleSessionService::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();

        String blockedReason = null;
        boolean canApply = true;

        if (hasApproved) {
            canApply = false;
            blockedReason = "Ke tashme nje grup te aprovuar";
        } else if (hasPending) {
            canApply = false;
            blockedReason = "Ke nje aplikim ne pritje";
        } else if ("CLOSED".equals(groupInfo.getStatus())) {
            canApply = false;
            blockedReason = "Grupi eshte i mbyllur";
        } else if (Boolean.TRUE.equals(groupInfo.getIsFull())) {
            canApply = false;
            blockedReason = "Grupi eshte plote";
        }

        return AvailableDepartmentGroupResponse.builder()
                .group(groupInfo)
                .schedules(schedules != null ? schedules : List.of())
                .canApply(canApply)
                .applyBlockedReason(blockedReason)
                .build();
    }

    private List<ScheduleSessionResponse> loadApprovedSchedules(Long userId, Long departmentGroupId) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserIdWithDetails(userId);
        if (profileOpt.isEmpty() || profileOpt.get().getDepartment() == null) {
            return List.of();
        }

        StudentProfile profile = profileOpt.get();
        return scheduleSessionRepository.findApprovedSchedulesForStudent(
                        profile.getDepartment().getId(),
                        profile.getCurrentSemester() != null ? profile.getCurrentSemester() : 1,
                        departmentGroupId)
                .stream()
                .map(scheduleSessionService::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private StudentGroupRequest getRequest(Long requestId) {
        return studentGroupRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Aplikimi nuk u gjet"));
    }

    private StudentProfile requireStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profili i studentit nuk u gjet"));
    }

    private void validateStudentDepartment(StudentProfile profile) {
        if (profile.getDepartment() == null) {
            throw new RuntimeException("Departamenti nuk eshte caktuar per kete student");
        }
    }

    private StudentGroupRequestResponse toResponse(StudentGroupRequest request) {
        if (request == null) {
            return null;
        }
        User student = request.getStudent();
        DepartmentGroup group = request.getDepartmentGroup();
        User approver = request.getApprovedBy();
        if (student == null || group == null) {
            return null;
        }
        Department department = group.getDepartment();

        return StudentGroupRequestResponse.builder()
                .id(request.getId())
                .studentId(student.getId())
                .studentFirstName(student.getEmri())
                .studentLastName(student.getMbiemri())
                .studentEmail(student.getEmail())
                .departmentId(department != null ? department.getId() : null)
                .departmentName(department != null ? department.getEmertimi() : null)
                .departmentGroupId(group.getId())
                .departmentGroupName(group.getName())
                .status(request.getStatus())
                .appliedAt(request.getAppliedAt())
                .approvedAt(request.getApprovedAt())
                .approvedById(approver != null ? approver.getId() : null)
                .approvedByName(approver != null ? approver.getEmri() + " " + approver.getMbiemri() : null)
                .build();
    }
}
