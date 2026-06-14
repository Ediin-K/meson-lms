package com.meson.service;

import com.meson.entity.Enrollment;
import com.meson.entity.EnrollmentStatus;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.LessonProgressRepository;
import com.meson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Single source of truth for course completion. The invariant is:
 *   PERFUNDUAR  ⟺  the student has viewed every lesson of every module currently in the subject.
 *
 * Completion is therefore derived, not stored manually. It is recomputed whenever a
 * student views a lesson AND whenever the subject's lesson set changes (a teacher adds
 * or removes a module/lesson), so adding a 13th module reopens a previously-completed
 * student until they view it.
 */
@Service
@RequiredArgsConstructor
public class EnrollmentCompletionService {

    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final CertificateService certificateService;

    /**
     * Re-derives completion for one enrollment and persists progress/status.
     * Returns the certificate code if this call just transitioned the enrollment to
     * completed (for the "you finished the course" UI), otherwise null.
     * Cancelled (ANULUAR) enrollments are left untouched.
     */
    @Transactional
    public String recalculateEnrollment(Enrollment enrollment) {
        if (enrollment.getStatusi() == EnrollmentStatus.ANULUAR) {
            return null;
        }

        Long subjectId = enrollment.getSubject().getId();
        Long studentId = enrollment.getUser().getId();

        long total = lessonRepository.countByModuleSubjectId(subjectId);
        long viewed = progressRepository.countViewedLessonsBySubject(studentId, subjectId);
        double pct = total > 0 ? Math.round(viewed * 100.0 / total) : 0;
        enrollment.setProgresi(pct);

        boolean complete = total > 0 && viewed >= total;

        if (complete && enrollment.getStatusi() != EnrollmentStatus.PERFUNDUAR) {
            enrollment.setStatusi(EnrollmentStatus.PERFUNDUAR);
            enrollmentRepository.save(enrollment);
            return certificateService.createForEnrollment(enrollment);
        }

        if (!complete && enrollment.getStatusi() == EnrollmentStatus.PERFUNDUAR) {
            // New/unviewed material means the course is no longer finished:
            // reopen the enrollment and pull the certificate until they re-complete.
            enrollment.setStatusi(EnrollmentStatus.AKTIV);
            certificateService.removeForEnrollment(enrollment.getId());
        }

        enrollmentRepository.save(enrollment);
        return null;
    }

    /**
     * Re-derives completion for every (non-cancelled) enrollment of a subject.
     * Call this after the subject's lesson set changes.
     */
    @Transactional
    public void recalculateSubject(Long subjectId) {
        enrollmentRepository.findBySubjectId(subjectId)
                .forEach(this::recalculateEnrollment);
    }
}
