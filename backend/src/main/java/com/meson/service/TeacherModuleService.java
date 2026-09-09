package com.meson.service;

import com.meson.dto.ModuleRequest;
import com.meson.dto.ModuleResponse;
import com.meson.entity.Subject;
import com.meson.entity.Module;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.SubjectRepository;
import com.meson.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherModuleService {

    private final ModuleRepository moduleRepository;
    private final SubjectRepository subjectRepository;
    private final com.meson.repository.LessonRepository lessonRepository;
    private final EnrollmentCompletionService completionService;
    private final SubjectAccessService subjectAccessService;

    public List<ModuleResponse> getModulesBySubject(Long subjectId) {
        subjectAccessService.assertManagesSubject(subjectId);
        return moduleRepository.findBySubjectIdOrderByRradhitjaAsc(subjectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ModuleResponse createModule(ModuleRequest request) {
        subjectAccessService.assertManagesSubject(request.getSubjectId());
        Subject course = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Lënda nuk ekziston."));

        Module module = Module.builder()
                .titulli(request.getTitulli())
                .pershkrimi(request.getPershkrimi())
                .rradhitja(request.getRradhitja())
                .subject(course)
                .build();

        return toResponse(moduleRepository.save(module));
    }

    public ModuleResponse updateModule(Long id, ModuleRequest request) {
        Module module = loadManagedModule(id);

        module.setTitulli(request.getTitulli());
        module.setPershkrimi(request.getPershkrimi());
        module.setRradhitja(request.getRradhitja());

        return toResponse(moduleRepository.save(module));
    }

    @Transactional
    public void deleteModule(Long id) {
        Module module = loadManagedModule(id);
        Long subjectId = module.getSubject().getId();
        moduleRepository.delete(module);
        // Deleting a module drops its lessons, changing what "complete" means.
        completionService.recalculateSubject(subjectId);
    }

    private Module loadManagedModule(Long id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Moduli nuk ekziston."));
        subjectAccessService.assertManagesSubject(module.getSubject().getId());
        return module;
    }

    private ModuleResponse toResponse(Module module) {
        return ModuleResponse.builder()
                .id(module.getId())
                .titulli(module.getTitulli())
                .pershkrimi(module.getPershkrimi())
                .rradhitja(module.getRradhitja())
                .createdAt(module.getCreatedAt())
                .subjectId(module.getSubject().getId())
                .subjectTitulli(module.getSubject().getTitulli())
                .lessonCount((int) lessonRepository.countByModuleId(module.getId()))
                .build();
    }
}
