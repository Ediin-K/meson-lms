package com.meson.service;

import com.meson.entity.Enrollment;
import com.meson.entity.SubjectGroup;
import com.meson.entity.User;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.SubjectGroupTeacherRepository;
import com.meson.repository.SubjectRepository;
import com.meson.repository.SubjectTeacherRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Authorization around the subject teacher pool.
 * <ul>
 *   <li>Content (modules/lessons/assignments/quizzes/files): any pool member.</li>
 *   <li>Grading: a pool member, further scoped to the group they teach — a
 *       teacher can only grade students in their own sections. Ungrouped students
 *       may be graded by any pool member.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class SubjectAccessService {

    private final SubjectTeacherRepository subjectTeacherRepository;
    private final SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public boolean isSubjectTeacher(Long userId, Long subjectId) {
        if (userId == null || subjectId == null) {
            return false;
        }
        if (subjectTeacherRepository.existsBySubjectIdAndTeacherId(subjectId, userId)) {
            return true;
        }
        // Compatibility: a subject with no pool rows yet (e.g. built directly in a test)
        // falls back to its denormalised primary teacher.
        if (subjectTeacherRepository.countBySubjectId(subjectId) == 0) {
            return subjectRepository.findById(subjectId)
                    .map(s -> s.getTeacher() != null && s.getTeacher().getId().equals(userId))
                    .orElse(false);
        }
        return false;
    }

    /** Content authz — throws unless admin or a member of the subject's teacher pool. */
    public void assertManagesSubject(Long subjectId) {
        assertManagesSubject(subjectId, currentUserId());
    }

    /** Same, for callers that already resolved the acting user's id. */
    public void assertManagesSubject(Long subjectId, Long userId) {
        if (hasRole("ADMIN")) {
            return;
        }
        if (!isSubjectTeacher(userId, subjectId)) {
            throw new AccessDeniedException("Nuk jeni mesues i kesaj lende.");
        }
    }

    /** Grading authz — pool member AND teacher of this student's group (or the student is ungrouped). */
    public void assertCanGradeStudent(Long subjectId, Long studentId) {
        if (hasRole("ADMIN")) {
            return;
        }
        Long userId = currentUserId();
        if (!isSubjectTeacher(userId, subjectId)) {
            throw new AccessDeniedException("Nuk jeni mesues i kesaj lende.");
        }
        SubjectGroup group = studentGroup(subjectId, studentId);
        if (group == null) {
            return; // ungrouped student — any pool member may grade
        }
        if (!subjectGroupTeacherRepository.existsBySubjectGroupIdAndTeacherId(group.getId(), userId)) {
            throw new AccessDeniedException("Ky student nuk eshte ne grupin qe ju mesoni.");
        }
    }

    /**
     * Every subject id a user teaches: pool membership plus — for compatibility with
     * subjects that predate the pool (e.g. built directly in a test) — the denormalised
     * primary. In backfilled data the primary is always already in the pool.
     */
    public List<Long> subjectIdsFor(Long userId) {
        java.util.LinkedHashSet<Long> ids = new java.util.LinkedHashSet<>();
        subjectTeacherRepository.findByTeacherId(userId).forEach(st -> ids.add(st.getSubject().getId()));
        subjectRepository.findByTeacherId(userId).forEach(s -> ids.add(s.getId()));
        return new java.util.ArrayList<>(ids);
    }

    /** Student ids in {@code subjectId} the current user may grade — their own groups, plus ungrouped. */
    public List<Long> gradableStudentIds(Long subjectId) {
        Long userId = currentUserId();
        boolean admin = hasRole("ADMIN");
        return enrollmentRepository.findBySubjectId(subjectId).stream()
                .filter(e -> {
                    if (admin) {
                        return true;
                    }
                    SubjectGroup group = groupOf(e);
                    return group == null
                            || subjectGroupTeacherRepository.existsBySubjectGroupIdAndTeacherId(group.getId(), userId);
                })
                .map(e -> e.getUser().getId())
                .toList();
    }

    private SubjectGroup studentGroup(Long subjectId, Long studentId) {
        return enrollmentRepository.findByUserIdAndSubjectId(studentId, subjectId)
                .map(this::groupOf)
                .orElse(null);
    }

    private SubjectGroup groupOf(Enrollment e) {
        if (e.getSubjectSubgroup() != null) {
            return e.getSubjectSubgroup().getSubjectGroup();
        }
        return e.getSubjectGroup();
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).map(User::getId).orElse(null);
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String target = "ROLE_" + role;
        for (GrantedAuthority a : auth.getAuthorities()) {
            if (target.equals(a.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
