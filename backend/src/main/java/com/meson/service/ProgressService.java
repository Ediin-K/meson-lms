package com.meson.service;

import com.meson.dto.SubjectProgressResponse;
import com.meson.dto.LessonViewResponse;
import com.meson.dto.ModuleProgressResponse;
import com.meson.entity.*;
import com.meson.entity.Module;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final LessonProgressRepository progressRepository;
    private final LessonRepository         lessonRepository;
    private final ModuleRepository         moduleRepository;
    private final SubjectRepository         subjectRepository;
    private final EnrollmentRepository     enrollmentRepository;
    private final UserRepository           userRepository;
    private final CertificateService       certificateService;

    @Transactional
    public LessonViewResponse markLessonViewed(Long lessonId) {
        User student = getCurrentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Leksioni nuk u gjet."));

        if (!progressRepository.existsByStudentIdAndLessonId(student.getId(), lessonId)) {
            progressRepository.save(LessonProgress.builder()
                    .student(student)
                    .lesson(lesson)
                    .viewedAt(LocalDateTime.now())
                    .build());
        }

        Long subjectId = lesson.getModule().getSubject().getId();
        String subjectTitulli = lesson.getModule().getSubject().getTitulli();
        String certCode = recalculateAndMaybeComplete(student.getId(), subjectId);

        boolean completed = certCode != null;
        return LessonViewResponse.builder()
                .subjectCompleted(completed)
                .certificateCode(certCode)
                .subjectTitulli(completed ? subjectTitulli : null)
                .build();
    }

    public SubjectProgressResponse getSubjectProgress(Long subjectId) {
        User student = getCurrentUser();
        return buildProgress(subjectId, student.getId());
    }

    public SubjectProgressResponse getStudentSubjectProgress(Long subjectId, Long studentId) {
        User teacher = getCurrentUser();
        subjectRepository.findByIdAndTeacherId(subjectId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kurs."));
        return buildProgress(subjectId, studentId);
    }

    private String recalculateAndMaybeComplete(Long studentId, Long subjectId) {
        return enrollmentRepository.findByUserIdAndSubjectId(studentId, subjectId)
                .map(enrollment -> {
                    long total  = lessonRepository.countByModuleSubjectId(subjectId);
                    long viewed = progressRepository.countViewedLessonsBySubject(studentId, subjectId);

                    double pct = total > 0 ? Math.round(viewed * 100.0 / total) : 0;
                    enrollment.setProgresi(pct);

                    if (total > 0 && viewed >= total
                            && EnrollmentStatus.AKTIV.equals(enrollment.getStatusi())) {
                        enrollment.setStatusi(EnrollmentStatus.PERFUNDUAR);
                        enrollmentRepository.save(enrollment);
                        return certificateService.createForEnrollment(enrollment);
                    }

                    enrollmentRepository.save(enrollment);
                    return null;
                })
                .orElse(null);
    }

    private SubjectProgressResponse buildProgress(Long subjectId, Long studentId) {
        Subject course = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Lënda nuk u gjet."));

        List<Module> modules = moduleRepository.findBySubjectIdOrderByRradhitjaAsc(subjectId);

        List<ModuleProgressResponse> moduleProgress = modules.stream().map(module -> {
            int total  = (int) lessonRepository.countByModuleId(module.getId());
            int viewed = (int) progressRepository.countViewedLessonsByModule(studentId, module.getId());
            double pct = total > 0 ? Math.round(viewed * 100.0 / total) : 0;
            return ModuleProgressResponse.builder()
                    .moduleId(module.getId())
                    .titulli(module.getTitulli())
                    .totalLessons(total)
                    .viewedLessons(viewed)
                    .progressPercent(pct)
                    .build();
        }).collect(Collectors.<ModuleProgressResponse>toList());

        int totalLessons  = moduleProgress.stream().mapToInt(ModuleProgressResponse::getTotalLessons).sum();
        int viewedLessons = moduleProgress.stream().mapToInt(ModuleProgressResponse::getViewedLessons).sum();
        double overallPct = totalLessons > 0 ? Math.round(viewedLessons * 100.0 / totalLessons) : 0;

        return SubjectProgressResponse.builder()
                .subjectId(subjectId)
                .subjectTitulli(course.getTitulli())
                .totalLessons(totalLessons)
                .viewedLessons(viewedLessons)
                .progressPercent(overallPct)
                .modules(moduleProgress)
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }
}
