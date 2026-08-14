package com.meson.service;

import com.meson.dto.LessonRequest;
import com.meson.dto.LessonResponse;
import com.meson.dto.LessonResourceResponse;
import com.meson.entity.Lesson;
import com.meson.entity.LessonResource;
import com.meson.entity.Module;
import com.meson.entity.User;
import com.meson.repository.LessonRepository;
import com.meson.repository.ModuleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.LessonResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherLessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final LessonResourceRepository lessonResourceRepository;
    private final LessonResourceMapper lessonResourceMapper;
    private final EnrollmentCompletionService completionService;

    public List<LessonResponse> getLessonsByModule(Long moduleId) {
        User teacher = getCurrentUser();
        
        moduleRepository.findByIdAndSubjectTeacherId(moduleId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë modul ose moduli nuk ekziston."));

        List<Lesson> lessons = lessonRepository.findByModuleIdOrderByRradhitjaAsc(moduleId);
        Map<Long, List<LessonResource>> resourcesByLesson = batchResourcesByLesson(lessons);
        return lessons.stream()
                .map(lesson -> toResponse(lesson, resourcesByLesson.getOrDefault(lesson.getId(), List.of())))
                .collect(Collectors.toList());
    }

    /** One query for every lesson's resources, instead of one per lesson. */
    private Map<Long, List<LessonResource>> batchResourcesByLesson(List<Lesson> lessons) {
        if (lessons.isEmpty()) {
            return Map.of();
        }
        List<Long> lessonIds = lessons.stream().map(Lesson::getId).toList();
        return lessonResourceRepository.findByLessonIdIn(lessonIds).stream()
                .collect(Collectors.groupingBy(r -> r.getLesson().getId()));
    }

    public LessonResponse createLesson(LessonRequest request) {
        User teacher = getCurrentUser();
        Module module = moduleRepository.findByIdAndSubjectTeacherId(request.getModuleId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë modul ose moduli nuk ekziston."));

        Lesson lesson = Lesson.builder()
                .titulli(request.getTitulli())
                .permbajtja(request.getPermbajtja())
                .lloji(request.getLloji())
                .videoUrl(request.getVideoUrl())
                .resourceUrl(request.getResourceUrl())
                .rradhitja(request.getRradhitja())
                .module(module)
                .build();

        LessonResponse response = toResponse(lessonRepository.save(lesson));
        // New material may reopen students who had already completed the subject.
        completionService.recalculateSubject(module.getSubject().getId());
        return response;
    }

    public LessonResponse updateLesson(Long id, LessonRequest request) {
        User teacher = getCurrentUser();
        Lesson lesson = lessonRepository.findByIdAndModuleSubjectTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        lesson.setTitulli(request.getTitulli());
        lesson.setPermbajtja(request.getPermbajtja());
        lesson.setLloji(request.getLloji());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setResourceUrl(request.getResourceUrl());
        lesson.setRradhitja(request.getRradhitja());

        return toResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long id) {
        User teacher = getCurrentUser();
        Lesson lesson = lessonRepository.findByIdAndModuleSubjectTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        Long subjectId = lesson.getModule().getSubject().getId();
        lessonRepository.delete(lesson);
        // Removing material may push a student to 100% of what remains.
        completionService.recalculateSubject(subjectId);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    private LessonResponse toResponse(Lesson lesson) {
        return toResponse(lesson, lessonResourceRepository.findByLessonId(lesson.getId()));
    }

    private LessonResponse toResponse(Lesson lesson, List<LessonResource> resources) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .titulli(lesson.getTitulli())
                .permbajtja(lesson.getPermbajtja())
                .lloji(lesson.getLloji())
                .videoUrl(lesson.getVideoUrl())
                .resourceUrl(lesson.getResourceUrl())
                .rradhitja(lesson.getRradhitja())
                .moduleId(lesson.getModule().getId())
                .moduleTitulli(lesson.getModule().getTitulli())
                .createdAt(lesson.getCreatedAt())
                .resources(resources.stream()
                        .map(lessonResourceMapper::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }
}
