package com.meson.service;

import com.meson.dto.AssistantReviewRequest;
import com.meson.dto.AssistantReviewResponse;
import com.meson.dto.AssistantReviewsForStudentResponse;
import com.meson.dto.AssistantRosterEntryResponse;
import com.meson.dto.AssistantSubjectResponse;
import com.meson.entity.AssistantReview;
import com.meson.entity.Enrollment;
import com.meson.entity.SubjectSubgroup;
import com.meson.entity.SubjectSubgroupTeacher;
import com.meson.entity.User;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.AssistantReviewRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.SubjectRepository;
import com.meson.repository.SubjectSubgroupTeacherRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssistantService {

    private final AssistantReviewRepository assistantReviewRepository;
    private final SubjectSubgroupTeacherRepository subjectSubgroupTeacherRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    // ── Assistant-facing ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AssistantSubjectResponse> getSubjects() {
        User me = currentUser();
        Map<Long, AssistantSubjectResponse> bySubject = new LinkedHashMap<>();
        Map<Long, java.util.Set<Long>> studentsBySubject = new LinkedHashMap<>();

        for (SubjectSubgroup subgroup : mySubgroups(me.getId())) {
            var subject = subgroup.getSubjectGroup().getSubject();
            AssistantSubjectResponse row = bySubject.computeIfAbsent(subject.getId(), id ->
                    AssistantSubjectResponse.builder()
                            .subjectId(subject.getId())
                            .subjectTitulli(subject.getTitulli())
                            .sectionNames(new java.util.ArrayList<>())
                            .studentCount(0)
                            .build());
            row.getSectionNames().add(subgroup.getName());

            var studentIds = studentsBySubject.computeIfAbsent(subject.getId(), id -> new java.util.HashSet<>());
            enrollmentRepository.findBySubjectSubgroupId(subgroup.getId())
                    .forEach(e -> studentIds.add(e.getUser().getId()));
        }
        bySubject.forEach((subjectId, row) ->
                row.setStudentCount(studentsBySubject.getOrDefault(subjectId, java.util.Set.of()).size()));
        return List.copyOf(bySubject.values());
    }

    @Transactional(readOnly = true)
    public List<AssistantRosterEntryResponse> getSubjectStudents(Long subjectId) {
        User me = currentUser();
        assertAssistsSubject(me, subjectId);

        Map<Long, User> students = new LinkedHashMap<>();
        for (SubjectSubgroup subgroup : mySubgroupsOnSubject(me.getId(), subjectId)) {
            for (Enrollment e : enrollmentRepository.findBySubjectSubgroupId(subgroup.getId())) {
                students.putIfAbsent(e.getUser().getId(), e.getUser());
            }
        }

        List<AssistantReview> myReviews = assistantReviewRepository
                .findByAssistantIdAndSubjectId(me.getId(), subjectId);
        Map<Long, List<AssistantReview>> byStudent = new LinkedHashMap<>();
        myReviews.forEach(r -> byStudent.computeIfAbsent(r.getStudent().getId(), k -> new java.util.ArrayList<>()).add(r));

        return students.values().stream()
                .map(student -> {
                    List<AssistantReview> rs = byStudent.getOrDefault(student.getId(), List.of());
                    long dated = rs.stream().filter(r -> r.getReviewDate() != null).count();
                    boolean hasFinal = rs.stream().anyMatch(r -> r.getReviewDate() == null);
                    var last = rs.stream()
                            .map(AssistantReview::getReviewDate)
                            .filter(java.util.Objects::nonNull)
                            .max(Comparator.naturalOrder())
                            .orElse(null);
                    return AssistantRosterEntryResponse.builder()
                            .studentId(student.getId())
                            .studentName(fullName(student))
                            .reviewCount((int) dated)
                            .lastReviewDate(last)
                            .hasFinal(hasFinal)
                            .build();
                })
                .sorted(Comparator.comparing(AssistantRosterEntryResponse::getStudentName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssistantReviewResponse> getStudentReviews(Long subjectId, Long studentId) {
        User me = currentUser();
        assertAssistsSubject(me, subjectId);
        return assistantReviewRepository
                .findByAssistantIdAndSubjectIdAndStudentIdOrderByReviewDateDesc(me.getId(), subjectId, studentId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AssistantReviewResponse saveReview(Long subjectId, Long studentId, AssistantReviewRequest request) {
        User me = currentUser();
        assertAssistsSubject(me, subjectId);
        validate(request);

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Studenti nuk u gjet"));
        var subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Lënda nuk u gjet"));

        AssistantReview review;
        if (request.getReviewDate() == null) {
            // Single final review per (assistant, student, subject): update in place if it exists.
            review = assistantReviewRepository
                    .findByAssistantIdAndSubjectIdAndStudentIdAndReviewDateIsNull(me.getId(), subjectId, studentId)
                    .orElseGet(AssistantReview::new);
        } else {
            review = new AssistantReview();
        }
        review.setAssistant(me);
        review.setStudent(student);
        review.setSubject(subject);
        review.setReviewDate(request.getReviewDate());
        review.setStars(request.getStars());
        review.setComment(trimToNull(request.getComment()));
        return toResponse(assistantReviewRepository.save(review));
    }

    @Transactional
    public AssistantReviewResponse updateReview(Long reviewId, AssistantReviewRequest request) {
        User me = currentUser();
        AssistantReview review = ownedReview(reviewId, me);
        validate(request);
        review.setReviewDate(request.getReviewDate());
        review.setStars(request.getStars());
        review.setComment(trimToNull(request.getComment()));
        return toResponse(assistantReviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        User me = currentUser();
        assistantReviewRepository.delete(ownedReview(reviewId, me));
    }

    // ── Teacher-facing (subject owner) ──────────────────────────────────

    @Transactional(readOnly = true)
    public AssistantReviewsForStudentResponse getReviewsForSubjectOwner(Long subjectId, Long studentId) {
        User me = currentUser();
        if (!hasRole("ADMIN")) {
            subjectRepository.findByIdAndTeacherId(subjectId, me.getId())
                    .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë."));
        }
        List<AssistantReview> all = assistantReviewRepository.findBySubjectIdAndStudentId(subjectId, studentId);
        return AssistantReviewsForStudentResponse.builder()
                .dated(all.stream()
                        .filter(r -> r.getReviewDate() != null)
                        .sorted(Comparator.comparing(AssistantReview::getReviewDate).reversed())
                        .map(this::toResponse).toList())
                .finalReview(all.stream()
                        .filter(r -> r.getReviewDate() == null)
                        .findFirst().map(this::toResponse).orElse(null))
                .build();
    }

    // ── internals ──────────────────────────────────────────────────────

    private void validate(AssistantReviewRequest request) {
        boolean noStars = request.getStars() == null;
        boolean noComment = trimToNull(request.getComment()) == null;
        if (noStars && noComment) {
            throw new BadRequestException("Shto një vlerësim ose një koment.");
        }
        if (request.getStars() != null && (request.getStars() < 1 || request.getStars() > 5)) {
            throw new BadRequestException("Vlerësimi duhet të jetë 1–5.");
        }
    }

    private AssistantReview ownedReview(Long reviewId, User me) {
        AssistantReview review = assistantReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Vlerësimi nuk u gjet"));
        if (!hasRole("ADMIN") && !review.getAssistant().getId().equals(me.getId())) {
            throw new AccessDeniedException("Ky vlerësim nuk është i juaji.");
        }
        return review;
    }

    private void assertAssistsSubject(User me, Long subjectId) {
        if (hasRole("ADMIN")) {
            return;
        }
        boolean assists = subjectSubgroupTeacherRepository.findByTeacherId(me.getId()).stream()
                .map(SubjectSubgroupTeacher::getSubjectSubgroup)
                .anyMatch(sg -> sg.getSubjectGroup().getSubject().getId().equals(subjectId));
        if (!assists) {
            throw new AccessDeniedException("Nuk jeni asistent në këtë lëndë.");
        }
    }

    private List<SubjectSubgroup> mySubgroups(Long userId) {
        return subjectSubgroupTeacherRepository.findByTeacherId(userId).stream()
                .map(SubjectSubgroupTeacher::getSubjectSubgroup)
                .toList();
    }

    private List<SubjectSubgroup> mySubgroupsOnSubject(Long userId, Long subjectId) {
        return mySubgroups(userId).stream()
                .filter(sg -> sg.getSubjectGroup().getSubject().getId().equals(subjectId))
                .toList();
    }

    private AssistantReviewResponse toResponse(AssistantReview r) {
        return AssistantReviewResponse.builder()
                .id(r.getId())
                .studentId(r.getStudent().getId())
                .studentName(fullName(r.getStudent()))
                .assistantId(r.getAssistant().getId())
                .assistantName(fullName(r.getAssistant()))
                .reviewDate(r.getReviewDate())
                .isFinal(r.getReviewDate() == null)
                .stars(r.getStars())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private static String fullName(User u) {
        return u.getEmri() + " " + u.getMbiemri();
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Përdoruesi nuk u gjet."));
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String target = "ROLE_" + role;
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (target.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
