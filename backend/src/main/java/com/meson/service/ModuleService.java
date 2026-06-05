package com.meson.service;

import com.meson.entity.Subject;
import com.meson.entity.Module;
import com.meson.repository.ModuleRepository;
import com.meson.dto.ModuleRequest;
import com.meson.dto.ModuleResponse;
import com.meson.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleService{

    private final ModuleRepository moduleRepository;
    private final SubjectRepository subjectRepository;

    public List<ModuleResponse> getAll(){
        return moduleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ModuleResponse getById(Long id){
        Module module = moduleRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Moduli nuk u gjet"));
        return toResponse(module);
    }

    public List<ModuleResponse> getBySubjectId(Long subjectId){
        return moduleRepository.findBySubjectIdOrderByRradhitjaAsc(subjectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ModuleResponse create(ModuleRequest request){
        if(moduleRepository.existsByTitulliAndSubjectId(request.getTitulli(),request.getSubjectId())){
            throw new RuntimeException("Moduli tashme ekziston ne kete kurs");
        }
        Module module = new Module();
        module.setTitulli(request.getTitulli());
        module.setPershkrimi(request.getPershkrimi());
        module.setRradhitja(request.getRradhitja());
        Subject course = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Lënda nuk u gjet"));
        module.setSubject(course);
        return toResponse(moduleRepository.save(module));
    }

    public ModuleResponse update(Long id,ModuleRequest request){
        Module module = moduleRepository.findById(id)
                .orElseThrow(()-> new RuntimeException ("Moduli nuk u gjet"));
        module.setTitulli(request.getTitulli());
        module.setPershkrimi(request.getPershkrimi());
        module.setRradhitja(request.getRradhitja());
        Subject course = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Lënda nuk u gjet"));
        module.setSubject(course);
        return toResponse(moduleRepository.save(module));
    }

    public void delete(Long id){
        if(!moduleRepository.existsById(id)){
            throw new RuntimeException("Moduli nuk u gjet");
        }
        moduleRepository.deleteById(id);
    }

    private ModuleResponse toResponse(Module module){
        return ModuleResponse.builder()
                .id(module.getId())
                .titulli(module.getTitulli())
                .pershkrimi(module.getPershkrimi())
                .rradhitja(module.getRradhitja())
                .createdAt(module.getCreatedAt())
                .subjectId(module.getSubject().getId())
                .subjectTitulli(module.getSubject().getTitulli())
                .build();
    }
}
