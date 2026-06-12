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
import com.meson.repository.StudentGroupSelectionRepository;
import com.meson.repository.StudentProfileRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import com.meson.repository.UserTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private static final Set<String> ALLOWED_ASSIGNABLE_ROLES = Set.of(
            "student", "teacher", "admin", "prind", "parent", "instructor"
    );

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
    private Role resolveAllowedRole(String requestedRole) {
        String dbRole = normalizeRoleForDB(requestedRole.trim().toLowerCase());
        if (!ALLOWED_ASSIGNABLE_ROLES.contains(dbRole)) {
            throw new RuntimeException("Roli nuk lejohet: " + requestedRole);
        }
        return roleRepository.findByEmertimi(dbRole)
                .orElseThrow(() -> new RuntimeException("Role nuk u gjet: " + dbRole));
    }

    private String normalizeRoleForDB(String role) {
        if ("parent".equals(role)) return "prind";
        if ("instructor".equals(role)) return "teacher";
        return role;
    }

    private String normalizeRoleForFrontend(String role) {
        if ("prind".equals(role)) return "parent";
        return role;
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
        return userRepository.searchPage(search == null ? "" : search.trim(),
                        role == null || role.isBlank() ? "" : normalizeRoleForDB(role.trim().toLowerCase()),
                        status == null ? "" : status.trim(), pageable)
                .map(this::toDto);
    }

    public List<UserDTO> getAll() {
        return userRepository.findAllWithRoles().stream()
                .map(this::toDto)
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

        if (dto.getRole() != null && !dto.getRole().isEmpty()) {
            Role role = resolveAllowedRole(dto.getRole());
            UserRole userRole = UserRole.builder()
                    .user(savedUser)
                    .role(role)
                    .build();
            userRoleRepository.save(userRole);
        }

        syncStudentProfile(savedUser, dto.getRole(), dto.getDepartmentId(), dto.getCurrentSemester());

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

        if (dto.getRole() != null && !dto.getRole().isEmpty()) {
            Role role = resolveAllowedRole(dto.getRole());

            var existingRoles = userRoleRepository.findByUser(user);
            if (existingRoles.isEmpty()) {
                UserRole userRole = UserRole.builder()
                        .user(user)
                        .role(role)
                        .build();
                userRoleRepository.save(userRole);
            } else {
                UserRole primaryRole = existingRoles.get(0);
                primaryRole.setRole(role);
                userRoleRepository.save(primaryRole);

                if (existingRoles.size() > 1) {
                    userRoleRepository.deleteAll(existingRoles.subList(1, existingRoles.size()));
                }
            }
        }

        syncStudentProfile(user, dto.getRole(), dto.getDepartmentId(), dto.getCurrentSemester());

        return userRepository.save(user);
    }

    public void delete(Long id) {
        // Block deletion if teacher has subjects (teacher_id NOT NULL in Subject)
        if (subjectRepository.countByTeacherId(id) > 0) {
            throw new RuntimeException(
                "Ky mësues ka lëndë të caktuara. Fshij ose ricakto lëndët para se të fshish mësuesin.");
        }

        // Teacher-specific: schedule sessions and group assignments
        scheduleSessionRepository.deleteByTeacherId(id);
        subjectGroupTeacherRepository.deleteByTeacherId(id);
        subjectSubgroupTeacherRepository.deleteByTeacherId(id);

        // Student-specific and general: all user-owned data
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

        // Fshi eksplicit para cascade (siguri shtesë)
        userTokenRepository.deleteByUserId(id);

        // UserRole, UserClaim, RefreshToken → CascadeType.ALL
        userRepository.deleteById(id);
    }

    private UserDTO toDto(User user) {
        String role = user.getUserRoles().stream()
                .findFirst()
                .map(userRole -> normalizeRoleForFrontend(userRole.getRole().getEmertimi()))
                .orElse("unknown");

        var profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);

        return new UserDTO(
                user.getId(),
                user.getEmri(),
                user.getMbiemri(),
                user.getEmail(),
                user.getStatusi(),
                role,
                profile != null && profile.getDepartment() != null ? profile.getDepartment().getId() : null,
                profile != null && profile.getDepartment() != null ? profile.getDepartment().getEmertimi() : null,
                profile != null ? profile.getCurrentSemester() : null,
                user.getDataKrijimit()
        );
    }

    private void syncStudentProfile(User user, String role, Long departmentId, Integer currentSemester) {
        if (!"student".equals(normalizeRoleForFrontend(normalizeRoleForDB(role)))) {
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
