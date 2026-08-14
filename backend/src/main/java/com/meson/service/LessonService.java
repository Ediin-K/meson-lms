package com.meson.service;

import com.meson.dto.LessonRequest;
import com.meson.dto.LessonResponse;
import com.meson.entity.Lesson;
import com.meson.entity.LessonResource;
import com.meson.entity.Module;
import com.meson.repository.LessonRepository;
import com.meson.repository.LessonResourceRepository;
import com.meson.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final LessonResourceRepository lessonResourceRepository;
    private final LessonResourceMapper lessonResourceMapper;
    private final EnrollmentCompletionService completionService;

    public List<LessonResponse> getByModuleId(Long moduleId) {
        List<Lesson> lessons = lessonRepository.findByModuleIdOrderByRradhitjaAsc(moduleId);
        Map<Long, List<LessonResource>> resourcesByLesson = batchResourcesByLesson(lessons);
        return lessons.stream()
                .map(lesson -> toResponse(lesson, resourcesByLesson.getOrDefault(lesson.getId(), List.of())))
                .toList();
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

    public LessonResponse getById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));
        return toResponse(lesson);
    }

    public LessonResponse create(LessonRequest request) {
        if (lessonRepository.existsByTitulliAndModuleId(request.getTitulli(), request.getModuleId())) {
            throw new RuntimeException("Leksioni tashmë ekziston në këtë modul");
        }

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Moduli nuk u gjet"));

        Lesson lesson = new Lesson();
        lesson.setTitulli(request.getTitulli());
        lesson.setPermbajtja(request.getPermbajtja());
        lesson.setLloji(request.getLloji());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setResourceUrl(request.getResourceUrl());
        lesson.setRradhitja(request.getRradhitja());
        lesson.setModule(module);

        LessonResponse response = toResponse(lessonRepository.save(lesson));
        completionService.recalculateSubject(module.getSubject().getId());
        return response;
    }

    public LessonResponse update(Long id, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Moduli nuk u gjet"));

        lesson.setTitulli(request.getTitulli());
        lesson.setPermbajtja(request.getPermbajtja());
        lesson.setLloji(request.getLloji());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setResourceUrl(request.getResourceUrl());
        lesson.setRradhitja(request.getRradhitja());
        lesson.setModule(module);

        return toResponse(lessonRepository.save(lesson));
    }

    public void delete(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leksioni nuk u gjet"));
        Long subjectId = lesson.getModule().getSubject().getId();
        lessonRepository.delete(lesson);
        completionService.recalculateSubject(subjectId);
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
                        .toList())
                .build();
    }
}
