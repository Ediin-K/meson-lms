package com.meson.service;

import com.meson.dto.CreateTeacherRequest;
import com.meson.dto.UpdateTeacherRequest;
import com.meson.dto.TeacherResponse;
import com.meson.dto.AssignTeacherRequest;
import com.meson.entity.User;
import com.meson.entity.Role;
import com.meson.entity.UserRole;
import com.meson.entity.Subject;
import com.meson.repository.UserRepository;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRoleRepository;
import com.meson.repository.SubjectRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherResponse createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email ekziston tashme");
        }

        User teacher = new User();
        teacher.setEmri(request.getEmri());
        teacher.setMbiemri(request.getMbiemri());
        teacher.setEmail(request.getEmail().toLowerCase());
        teacher.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        teacher.setTemporaryPassword(true);
        teacher.setPhoneNumber(request.getPhoneNumber());
        teacher.setDataKrijimit(LocalDateTime.now());
        teacher.setStatusi(request.getStatusi());
        teacher.setLockoutEnabled(false);

        User savedTeacher = userRepository.save(teacher);

        Role teacherRole = roleRepository.findByEmertimi("teacher")
                .orElseThrow(() -> new RuntimeException("Role teacher nuk u gjet"));

        UserRole userRole = UserRole.builder()
                .user(savedTeacher)
                .role(teacherRole)
                .build();
        userRoleRepository.save(userRole);

        return toTeacherResponse(savedTeacher, 0L);
    }

    public TeacherResponse updateTeacher(Long id, UpdateTeacherRequest request) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mësuesi nuk u gjet"));

        if (request.getEmri() != null) teacher.setEmri(request.getEmri());
        if (request.getMbiemri() != null) teacher.setMbiemri(request.getMbiemri());
        if (request.getPhoneNumber() != null) teacher.setPhoneNumber(request.getPhoneNumber());
        if (request.getStatusi() != null) teacher.setStatusi(request.getStatusi());

        if (request.getEmail() != null && !request.getEmail().equals(teacher.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                throw new RuntimeException("Email ekziston tashmë");
            }
            teacher.setEmail(request.getEmail().toLowerCase());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            teacher.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updatedTeacher = userRepository.save(teacher);
        Long subjectCount = (long) subjectRepository.findByTeacherId(id).size();
        return toTeacherResponse(updatedTeacher, subjectCount);
    }

    public void deleteTeacher(Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mësuesi nuk u gjet"));

        List<Subject> subjects = subjectRepository.findByTeacherId(id);
        if (!subjects.isEmpty()) {
            throw new RuntimeException("Nuk mund ta fshish mësuesin; i ka Lëndë të lidhura. Hiq fillimisht të gjitha Lëndët ose zhvendo mësuesin.");
        }

        userRepository.deleteById(id);
    }

    public List<TeacherResponse> getAllTeachers() {
        List<User> teachers = userRepository.findAllByRoleNormalizedName("TEACHER");
        return teachers.stream()
                .map(t -> {
                    Long subjectCount = (long) subjectRepository.findByTeacherId(t.getId()).size();
                    return toTeacherResponse(t, subjectCount);
                })
                .toList();
    }

    public TeacherResponse getTeacherById(Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mësuesi nuk u gjet"));

        var userRoles = userRoleRepository.findByUser(teacher);
        boolean isTeacher = userRoles.stream()
                .anyMatch(ur -> "TEACHER".equals(ur.getRole().getNormalizedName()));

        if (!isTeacher) {
            throw new RuntimeException("Përdoruesi nuk ka rolin e mësuesit");
        }

        Long subjectCount = (long) subjectRepository.findByTeacherId(id).size();
        return toTeacherResponse(teacher, subjectCount);
    }

    public List<TeacherResponse> searchTeachers(String term) {
        List<User> teachers = userRepository.searchByRoleNormalizedNameAndTerm("TEACHER", term);
        return teachers.stream()
                .map(t -> {
                    Long subjectCount = (long) subjectRepository.findByTeacherId(t.getId()).size();
                    return toTeacherResponse(t, subjectCount);
                })
                .toList();
    }

    public void assignTeacherToSubject(AssignTeacherRequest request) {
        Subject course = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Lënda nuk u gjet"));

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Mësuesi nuk u gjet"));

        var userRoles = userRoleRepository.findByUser(teacher);
        boolean isTeacher = userRoles.stream()
                .anyMatch(ur -> "TEACHER".equals(ur.getRole().getNormalizedName()));

        if (!isTeacher) {
            throw new RuntimeException("Përdoruesi nuk ka rolin e mësuesit");
        }

        course.setTeacher(teacher);
        subjectRepository.save(course);
    }

    private TeacherResponse toTeacherResponse(User teacher, Long subjectCount) {
        return TeacherResponse.builder()
                .id(teacher.getId())
                .emri(teacher.getEmri())
                .mbiemri(teacher.getMbiemri())
                .email(teacher.getEmail())
                .phoneNumber(teacher.getPhoneNumber())
                .statusi(teacher.getStatusi())
                .dataKrijimit(teacher.getDataKrijimit())
                .subjectCount(subjectCount.intValue())
                .build();
    }
}
