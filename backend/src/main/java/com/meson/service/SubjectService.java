package com.meson.service;

import com.meson.dto.SubjectResponse;
import com.meson.dto.SubjectRequest;
import com.meson.entity.Subject;
import com.meson.entity.User;
import com.meson.entity.Direction;
import com.meson.repository.SubjectRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.DirectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final DirectionRepository directionRepository;

    public List<SubjectResponse> getAll() {
        return subjectRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SubjectResponse getById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lënda nuk u gjet"));
        return toResponse(subject);
    }

    public SubjectResponse create(SubjectRequest request) {
        if (subjectRepository.existsByTitulli(request.getTitulli())) {
            throw new RuntimeException("Lënda tashmë ekziston");
        }

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Mesuesi nuk u gjet"));

        Direction direction = directionRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Drejtimi nuk u gjet"));

        Subject subject = new Subject();
        subject.setTitulli(request.getTitulli());
        subject.setPershkrimi(request.getPershkrimi());
        subject.setCmimi(request.getCmimi());
        subject.setEcts(request.getEcts() != null ? request.getEcts() : 5);
        subject.setNiveli(request.getNiveli());
        subject.setStatusi(request.getStatusi());
        subject.setTeacher(teacher);
        subject.setDirection(direction);
        subject.setSemester(request.getSemester());
        subject.setEnrollmentKey(normalizeEnrollmentKey(request.getEnrollmentKey()));

        return toResponse(subjectRepository.save(subject));
    }

    public SubjectResponse update(Long id, SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lënda nuk u gjet"));

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Mesuesi nuk u gjet"));

        Direction direction = directionRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Drejtimi nuk u gjet"));

        subject.setTitulli(request.getTitulli());
        subject.setPershkrimi(request.getPershkrimi());
        subject.setCmimi(request.getCmimi());
        subject.setEcts(request.getEcts() != null ? request.getEcts() : 5);
        subject.setNiveli(request.getNiveli());
        subject.setStatusi(request.getStatusi());
        subject.setTeacher(teacher);
        subject.setDirection(direction);
        subject.setSemester(request.getSemester());
        subject.setEnrollmentKey(normalizeEnrollmentKey(request.getEnrollmentKey()));

        return toResponse(subjectRepository.save(subject));
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new RuntimeException("Lënda nuk u gjet");
        }
        subjectRepository.deleteById(id);
    }

    private SubjectResponse toResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .titulli(subject.getTitulli())
                .pershkrimi(subject.getPershkrimi())
                .teacherId(subject.getTeacher().getId())
                .teacherName(subject.getTeacher().getEmri())
                .categoryId(subject.getDirection().getId())
                .categoryName(subject.getDirection().getEmertimi())
                .semester(subject.getSemester())
                .enrollmentKey(subject.getEnrollmentKey())
                .cmimi(subject.getCmimi())
                .ects(subject.getEcts())
                .niveli(subject.getNiveli())
                .statusi(subject.getStatusi())
                .createdAt(subject.getCreatedAt())
                .build();
    }

    public List<SubjectResponse> getByDirectionAndSemester(Long directionId, Integer semester) {
        return subjectRepository
                .findByDirectionIdAndSemester(directionId, semester)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<SubjectResponse> getBySemester(Integer semester) {
        return subjectRepository.findBySemester(semester)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String normalizeEnrollmentKey(String enrollmentKey) {
        if (!StringUtils.hasText(enrollmentKey)) {
            return null;
        }
        return enrollmentKey.trim();
    }

}
