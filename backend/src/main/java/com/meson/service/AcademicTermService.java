package com.meson.service;

import com.meson.dto.AcademicTermRequest;
import com.meson.dto.AcademicTermResponse;
import com.meson.entity.AcademicTerm;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.AcademicTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicTermService {

    private final AcademicTermRepository academicTermRepository;

    public List<AcademicTermResponse> getAll() {
        return academicTermRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AcademicTermResponse getById(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    public AcademicTermResponse create(AcademicTermRequest request) {
        validateWindows(request);

        AcademicTerm term = AcademicTerm.builder()
                .name(request.getName())
                .enrollmentStart(request.getEnrollmentStart())
                .enrollmentEnd(request.getEnrollmentEnd())
                .examApplicationStart(request.getExamApplicationStart())
                .examApplicationEnd(request.getExamApplicationEnd())
                .build();

        return toResponse(academicTermRepository.save(term));
    }

    public AcademicTermResponse update(Long id, AcademicTermRequest request) {
        validateWindows(request);

        AcademicTerm term = findByIdOrThrow(id);
        term.setName(request.getName());
        term.setEnrollmentStart(request.getEnrollmentStart());
        term.setEnrollmentEnd(request.getEnrollmentEnd());
        term.setExamApplicationStart(request.getExamApplicationStart());
        term.setExamApplicationEnd(request.getExamApplicationEnd());

        return toResponse(academicTermRepository.save(term));
    }

    @Transactional
    public AcademicTermResponse activate(Long id) {
        AcademicTerm term = findByIdOrThrow(id);

        academicTermRepository.findByActiveTrue()
                .filter(current -> !current.getId().equals(id))
                .ifPresent(current -> {
                    current.setActive(false);
                    academicTermRepository.save(current);
                });

        term.setActive(true);
        return toResponse(academicTermRepository.save(term));
    }

    public void delete(Long id) {
        AcademicTerm term = findByIdOrThrow(id);
        if (term.isActive()) {
            throw new BadRequestException("Nuk mund te fshihet afati aktiv - aktivizoni nje tjeter fillimisht.");
        }
        academicTermRepository.delete(term);
    }

    private void validateWindows(AcademicTermRequest request) {
        if (!request.getEnrollmentStart().isBefore(request.getEnrollmentEnd())) {
            throw new BadRequestException("Fillimi i regjistrimit duhet te jete para mbarimit.");
        }
        if (!request.getExamApplicationStart().isBefore(request.getExamApplicationEnd())) {
            throw new BadRequestException("Fillimi i paraqitjes se provimeve duhet te jete para mbarimit.");
        }
    }

    private AcademicTerm findByIdOrThrow(Long id) {
        return academicTermRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Afati akademik nuk u gjet"));
    }

    private AcademicTermResponse toResponse(AcademicTerm term) {
        return AcademicTermResponse.builder()
                .id(term.getId())
                .name(term.getName())
                .active(term.isActive())
                .enrollmentStart(term.getEnrollmentStart())
                .enrollmentEnd(term.getEnrollmentEnd())
                .examApplicationStart(term.getExamApplicationStart())
                .examApplicationEnd(term.getExamApplicationEnd())
                .build();
    }

    public void assertEnrollmentWindowOpen() {
        AcademicTerm term = getActiveTermOrThrow();
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(term.getEnrollmentStart()) || now.isAfter(term.getEnrollmentEnd())) {
            throw new BadRequestException("Regjistrimi nuk eshte i hapur aktualisht.");
        }
    }

    public void assertExamApplicationWindowOpen() {
        AcademicTerm term = getActiveTermOrThrow();
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(term.getExamApplicationStart()) || now.isAfter(term.getExamApplicationEnd())) {
            throw new BadRequestException("Paraqitja e provimeve nuk eshte e hapur aktualisht.");
        }
    }

    private AcademicTerm getActiveTermOrThrow() {
        return academicTermRepository.findByActiveTrue()
                .orElseThrow(() -> new BadRequestException("Nuk ka afat akademik aktiv aktualisht."));
    }
}
