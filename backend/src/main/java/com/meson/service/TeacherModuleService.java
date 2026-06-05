package com.meson.service;

import com.meson.dto.ModuleRequest;
import com.meson.dto.ModuleResponse;
import com.meson.entity.Subject;
import com.meson.entity.Module;
import com.meson.entity.User;
import com.meson.repository.SubjectRepository;
import com.meson.repository.ModuleRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherModuleService {

    private final ModuleRepository moduleRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final com.meson.repository.LessonRepository lessonRepository;

    public List<ModuleResponse> getModulesBySubject(Long subjectId) {
        User teacher = getCurrentUser();
        return moduleRepository.findBySubjectIdAndSubjectTeacherId(subjectId, teacher.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ModuleResponse createModule(ModuleRequest request) {
        User teacher = getCurrentUser();
        Subject course = subjectRepository.findByIdAndTeacherId(request.getSubjectId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kurs ose Lënda nuk ekziston."));

        Module module = Module.builder()
                .titulli(request.getTitulli())
                .pershkrimi(request.getPershkrimi())
                .rradhitja(request.getRradhitja())
                .subject(course)
                .build();

        return toResponse(moduleRepository.save(module));
    }

    public ModuleResponse updateModule(Long id, ModuleRequest request) {
        User teacher = getCurrentUser();
        Module module = moduleRepository.findByIdAndSubjectTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë modul ose moduli nuk ekziston."));

        module.setTitulli(request.getTitulli());
        module.setPershkrimi(request.getPershkrimi());
        module.setRradhitja(request.getRradhitja());

        return toResponse(moduleRepository.save(module));
    }

    @Transactional
    public void deleteModule(Long id) {
        User teacher = getCurrentUser();
        Module module = moduleRepository.findByIdAndSubjectTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë modul ose moduli nuk ekziston."));

        moduleRepository.delete(module);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
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
