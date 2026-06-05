package com.meson.service;

import com.meson.dto.DirectionRequest;
import com.meson.dto.DirectionResponse;
import com.meson.entity.Direction;
import com.meson.repository.DirectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DirectionService {

    private final DirectionRepository directionRepository;

    public List<DirectionResponse> getAll() {
        return directionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DirectionResponse getById(Long id) {
        Direction direction = directionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Drejtimi nuk u gjet"));
        return toResponse(direction);
    }

    public DirectionResponse create(DirectionRequest request) {
        if (directionRepository.existsByEmertimi(request.getEmertimi())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Drejtimi me këtë emër ekziston tashmë");
        }

        Direction direction = new Direction();
        direction.setEmertimi(request.getEmertimi());
        direction.setPershkrimi(request.getPershkrimi());

        return toResponse(directionRepository.save(direction));
    }

    public DirectionResponse update(Long id, DirectionRequest request) {
        Direction direction = directionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Drejtimi nuk u gjet"));

        directionRepository.findByEmertimi(request.getEmertimi())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Drejtimi me këtë emër ekziston tashmë");
                });

        direction.setEmertimi(request.getEmertimi());
        direction.setPershkrimi(request.getPershkrimi());

        return toResponse(directionRepository.save(direction));
    }

    public void delete(Long id) {
        Direction direction = directionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Drejtimi nuk u gjet"));

        if (!direction.getSubjects().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nuk mund të fshish drejtimin — ka lëndë në këtë drejtim");
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
