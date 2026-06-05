package com.meson.service;

import com.meson.dto.DirectionRequest;
import com.meson.dto.DirectionResponse;
import com.meson.entity.Direction;
import com.meson.repository.DirectionRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DirectionCategoryService {

    private final DirectionRepository directionRepository;

    public List<DirectionResponse> getAll() {
        return directionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DirectionResponse getById(Long id) {
        Direction direction = directionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drejtimi nuk u gjet"));
        return toResponse(direction);
    }

    public DirectionResponse create(DirectionRequest request) {
        if (directionRepository.existsByEmertimi(request.getEmertimi())) {
            throw new RuntimeException("Drejtimi me këtë emër ekziston tashmë");
        }
        Direction direction = new Direction();
        direction.setEmertimi(request.getEmertimi());
        direction.setPershkrimi(request.getPershkrimi());
        return toResponse(directionRepository.save(direction));
    }

    public DirectionResponse update(Long id, DirectionRequest request) {
        Direction direction = directionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drejtimi nuk u gjet"));
        direction.setEmertimi(request.getEmertimi());
        direction.setPershkrimi(request.getPershkrimi());
        return toResponse(directionRepository.save(direction));
    }

    public void delete(Long id) {
        Direction direction = directionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drejtimi nuk u gjet"));
        if (!direction.getSubjects().isEmpty()) {
            throw new RuntimeException("Nuk mund të fshish drejtimin — ka lëndë në këtë drejtim");
        }
        directionRepository.deleteById(id);
    }

    private DirectionResponse toResponse(Direction direction) {
        return DirectionResponse.builder()
                .id(direction.getId())
                .emertimi(direction.getEmertimi())
                .pershkrimi(direction.getPershkrimi())
                .build();
    }
}
