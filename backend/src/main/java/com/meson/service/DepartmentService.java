package com.meson.service;

import com.meson.dto.DepartmentRequest;
import com.meson.dto.DepartmentResponse;
import com.meson.entity.Department;
import com.meson.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DepartmentResponse getById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Departamenti nuk u gjet"));
        return toResponse(department);
    }

    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByEmertimi(request.getEmertimi())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Departamenti me këtë emër ekziston tashmë");
        }

        Department department = new Department();
        department.setEmertimi(request.getEmertimi());
        department.setPershkrimi(request.getPershkrimi());
        department.setNumSemesters(request.getNumSemesters());

        return toResponse(departmentRepository.save(department));
    }

    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Departamenti nuk u gjet"));

        departmentRepository.findByEmertimi(request.getEmertimi())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Departamenti me këtë emër ekziston tashmë");
                });

        department.setEmertimi(request.getEmertimi());
        department.setPershkrimi(request.getPershkrimi());
        department.setNumSemesters(request.getNumSemesters());

        return toResponse(departmentRepository.save(department));
    }

    public void delete(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Departamenti nuk u gjet"));

        if (!department.getSubjects().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nuk mund të fshish departamentin — ka lëndë në këtë departament");
        }

        departmentRepository.deleteById(id);
    }

    private DepartmentResponse toResponse(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .emertimi(department.getEmertimi())
                .pershkrimi(department.getPershkrimi())
                .numSemesters(department.getNumSemesters())
                .build();
    }
}
