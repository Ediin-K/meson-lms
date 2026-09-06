package com.meson.service;

import com.meson.dto.UserDTO;
import com.meson.dto.CreateUserDTO;
import com.meson.dto.UpdateUserDTO;
import com.meson.entity.Role;
import com.meson.entity.Department;
import com.meson.entity.StudentProfile;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.AssignmentSubmissionRepository;
import com.meson.repository.CertificateRepository;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.SubjectGroupTeacherRepository;
import com.meson.repository.SubjectRepository;
import com.meson.repository.SubjectSubgroupTeacherRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.GradeRepository;
import com.meson.repository.LessonProgressRepository;
import com.meson.repository.QuizAttemptRepository;
import com.meson.repository.RoleRepository;
import com.meson.repository.ScheduleSessionRepository;
import com.meson.repository.StudentGroupRequestRepository;
import com.meson.repository.AttendanceRecordRepository;
import com.meson.repository.StudentGroupSelectionRepository;
import com.meson.repository.StudentProfileRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import com.meson.repository.UserTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    // "prind"/"parent" and "assistant" are deliberately excluded: neither role has a
    // dashboard or any permission checks built for it, so assigning one creates an
    // account with nowhere to go and nothing it can do after logging in.
    private static final Set<String> ALLOWED_ASSIGNABLE_ROLES = Set.of(
            "student", "teacher", "admin", "instructor", "department_head"
    );

    private static final Set<String> PROFILE_ROLES = Set.of("student", "teacher", "assistant");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final GradeRepository gradeRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final StudentGroupRequestRepository studentGroupRequestRepository;
    private final StudentGroupSelectionRepository studentGroupSelectionRepository;
    private final SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    private final SubjectSubgroupTeacherRepository subjectSubgroupTeacherRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;
    private final UserTokenRepository userTokenRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    private Role resolveAllowedRole(String requestedRole) {
        String dbRole = normalizeRoleForDB(requestedRole.trim().toLowerCase());
        if (!ALLOWED_ASSIGNABLE_ROLES.contains(dbRole)) {
            throw new RuntimeException("Roli nuk lejohet: " + requestedRole);
        }
        return roleRepository.findByEmertimi(dbRole)
                .orElseThrow(() -> new RuntimeException("Role nuk u gjet: " + dbRole));
    }

    /**
     * The roles a create/update request wants to assign: {@code roles} when the client sent it,
     * otherwise the single-role {@code role} shorthand, otherwise null (= leave roles untouched).
     * De-duplicated and lowercased.
     */
    private List<String> effectiveRoles(List<String> roles, String role) {
        List<String> source = roles;
        if (source == null) {
            if (role == null || role.isBlank()) {
                return null;
            }
            source = List.of(role);
        }
        return source.stream()
                .filter(r -> r != null && !r.isBlank())
                .map(r -> r.trim().toLowerCase())
                .distinct()
                .toList();
    }

    private String normalizeRoleForDB(String role) {
        if ("parent".equals(role)) return "prind";
        if ("instructor".equals(role)) return "teacher";
        return role;
    }

    private String normalizeRoleForFrontend(String role) {
        if ("prind".equals(role)) return "parent";
        return role; // "assistant" passes through as-is
    }

    public void activate(Long id) {
        User user = getById(id);
        user.setStatusi("active");
        userRepository.save(user);
    }

    public void deactivate(Long id) {
        User user = getById(id);
        user.setStatusi("inactive");
        userRepository.save(user);
    }

    public org.springframework.data.domain.Page<UserDTO> getPage(String search, String role, String status,
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<User> page = userRepository.searchPage(
                search == null ? "" : search.trim(),
                role == null || role.isBlank() ? "" : normalizeRoleForDB(role.trim().toLowerCase()),
                status == null ? "" : status.trim(), pageable);

        List<User> users = page.getContent();
        Map<Long, List<String>> rolesByUserId = batchRoles(users);
        Map<Long, StudentProfile> profileByUserId = batchStudentProfiles(users);
        return page.map(user -> toDto(user, rolesByUserId.get(user.getId()), profileByUserId.get(user.getId())));
    }

    public List<UserDTO> getAll() {
        List<User> users = userRepository.findAllWithRoles();
        Map<Long, StudentProfile> profileByUserId = batchStudentProfiles(users);
        return users.stream()
                .map(user -> toDto(user, resolveRolesFromLoaded(user), profileByUserId.get(user.getId())))
                .toList();
    }

    /** Every listed user's full role set in one query, instead of a lazy per-row load. */
    private Map<Long, List<String>> batchRoles(List<User> users) {
        if (users.isEmpty()) {
            return Map.of();
        }
        List<Long> userIds = users.stream().map(User::getId).toList();
        Map<Long, List<String>> rolesByUserId = new HashMap<>();
        userRoleRepository.findByUserIdIn(userIds).forEach(ur ->
                rolesByUserId.computeIfAbsent(ur.getUserId(), k -> new ArrayList<>())
                        .add(normalizeRoleForFrontend(ur.getRoleName())));
        return rolesByUserId;
    }

    /** One query for every listed user's student profile, instead of one per user. */
    private Map<Long, StudentProfile> batchStudentProfiles(List<User> users) {
        if (users.isEmpty()) {
            return Map.of();
        }
        List<Long> userIds = users.stream().map(User::getId).toList();
        return studentProfileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(sp -> sp.getUser().getId(), sp -> sp));
    }

    private List<String> resolveRolesFromLoaded(User user) {
        if (user.getUserRoles() == null) {
            return List.of();
        }
        return user.getUserRoles().stream()
                .filter(ur -> ur.getRole() != null)
                .map(ur -> normalizeRoleForFrontend(ur.getRole().getEmertimi()))
                .distinct()
                .toList();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User nuk u gjet"));
    }

    public User create(CreateUserDTO dto) {
        if (userRepository.existsByEmailIgnoreCase(dto.getEmail())) {
            throw new RuntimeException("Email ekziston tashmë");
        }
        if (dto.getPassword() == null || dto.getPassword().isEmpty()) {
            throw new RuntimeException("Fjalëkalimi nuk mund të jetë bosh");
        }

        User user = new User();
        user.setEmri(dto.getEmri());
        user.setMbiemri(dto.getMbiemri());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setTemporaryPassword(true);
        user.setDataKrijimit(LocalDateTime.now());
        user.setStatusi(dto.getStatusi() != null ? dto.getStatusi() : "active");
        user.setLockoutEnabled(false);
        User savedUser = userRepository.save(user);

        List<String> requestedRoles = effectiveRoles(dto.getRoles(), dto.getRole());
        if (requestedRoles != null) {
            for (String r : requestedRoles) {
                userRoleRepository.save(UserRole.builder()
                        .user(savedUser)
                        .role(resolveAllowedRole(r))
                        .build());
            }
        }

        syncStudentProfile(savedUser, requestedRoles, dto.getDepartmentId(), dto.getCurrentSemester());

        return savedUser;
    }

    public User update(Long id, UpdateUserDTO dto) {
        User user = getById(id);

        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(dto.getEmail())) {
                throw new RuntimeException("Email ekziston tashmë");
            }
            user.setEmail(dto.getEmail());
        }

        user.setEmri(dto.getEmri());
        user.setMbiemri(dto.getMbiemri());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setStatusi(dto.getStatusi());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        List<String> requestedRoles = effectiveRoles(dto.getRoles(), dto.getRole());
        if (requestedRoles != null) {
            if (requestedRoles.isEmpty()) {
                throw new RuntimeException("Përdoruesi duhet të ketë të paktën një rol");
            }
            // Resolve (and validate) every requested role up front, keyed by id.
            Map<Long, Role> target = new LinkedHashMap<>();
            for (String r : requestedRoles) {
                Role role = resolveAllowedRole(r);
                target.put(role.getId(), role);
            }

            List<UserRole> existing = userRoleRepository.findByUser(user);
            Set<Long> existingRoleIds = existing.stream()
                    .map(ur -> ur.getRole().getId())
                    .collect(Collectors.toSet());

            userRoleRepository.deleteAll(existing.stream()
                    .filter(ur -> !target.containsKey(ur.getRole().getId()))
                    .toList());

            target.values().stream()
                    .filter(role -> !existingRoleIds.contains(role.getId()))
                    .forEach(role -> userRoleRepository.save(UserRole.builder()
                            .user(user)
                            .role(role)
                            .build()));
        }

        List<String> rolesForProfileSync = requestedRoles != null ? requestedRoles : currentRoleDbNames(user);
        syncStudentProfile(user, rolesForProfileSync, dto.getDepartmentId(), dto.getCurrentSemester());

        return userRepository.save(user);
    }

    public void delete(Long id) {
        // Block deletion if teacher has subjects (teacher_id NOT NULL in Subject)
        if (subjectRepository.countByTeacherId(id) > 0) {
            throw new RuntimeException(
                "Ky mësues ka lëndë të caktuara. Fshij ose ricakto lëndët para se të fshish mësuesin.");
        }

        // Teacher-specific: schedule sessions and group assignments
        // Attendance records FK to schedule_sessions, so must be cleared before the sessions themselves.
        attendanceRecordRepository.deleteByScheduleSessionTeacherId(id);
        scheduleSessionRepository.deleteByTeacherId(id);
        subjectGroupTeacherRepository.deleteByTeacherId(id);
        subjectSubgroupTeacherRepository.deleteByTeacherId(id);

        // Student-specific and general: all user-owned data
        attendanceRecordRepository.deleteByStudentId(id);
        attendanceRecordRepository.deleteByMarkedById(id);
        lessonProgressRepository.deleteByStudentId(id);
        assignmentSubmissionRepository.deleteByStudentId(id);
        quizAttemptRepository.deleteByUserId(id);
        gradeRepository.deleteByStudentId(id);
        gradeRepository.deleteByProfessorId(id);
        studentGroupSelectionRepository.deleteByStudentId(id);
        studentGroupRequestRepository.deleteByApprovedById(id);
        studentGroupRequestRepository.deleteByStudentId(id);

        // Certificate must be deleted before Enrollment (FK: certificate.enrollment_id)
        certificateRepository.deleteByEnrollmentUserId(id);
        enrollmentRepository.deleteByUserId(id);

        studentProfileRepository.deleteByUserId(id);

        // Department Head: unassign (don't cascade-delete the department itself)
        departmentRepository.clearHeadByUserId(id);

        // Fshi eksplicit para cascade (siguri shtesë)
        userTokenRepository.deleteByUserId(id);

        // UserRole, UserClaim, RefreshToken → CascadeType.ALL
        userRepository.deleteById(id);
    }

    /** Role names (db form, e.g. "teacher") the user currently holds. */
    private List<String> currentRoleDbNames(User user) {
        return userRoleRepository.findByUser(user).stream()
                .map(ur -> ur.getRole().getEmertimi().toLowerCase())
                .toList();
    }

    private UserDTO toDto(User user, List<String> roles, StudentProfile profile) {
        return new UserDTO(
                user.getId(),
                user.getEmri(),
                user.getMbiemri(),
                user.getEmail(),
                user.getStatusi(),
                roles != null && !roles.isEmpty() ? roles : List.of("unknown"),
                profile != null && profile.getDepartment() != null ? profile.getDepartment().getId() : null,
                profile != null && profile.getDepartment() != null ? profile.getDepartment().getEmertimi() : null,
                profile != null ? profile.getCurrentSemester() : null,
                user.getDataKrijimit()
        );
    }

    private void syncStudentProfile(User user, List<String> roles, Long departmentId, Integer currentSemester) {
        boolean hasProfileRole = roles != null && roles.stream()
                .map(r -> normalizeRoleForFrontend(normalizeRoleForDB(r)))
                .anyMatch(PROFILE_ROLES::contains);
        if (!hasProfileRole) {
            return;
        }

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> StudentProfile.builder()
                        .user(user)
                        .currentSemester(1)
                        .build());

        if (departmentId != null) {
            Department department = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new RuntimeException("Departamenti nuk u gjet"));
            profile.setDepartment(department);
        }

        profile.setCurrentSemester(currentSemester != null ? currentSemester : profile.getCurrentSemester());
        studentProfileRepository.save(profile);
    }
}
