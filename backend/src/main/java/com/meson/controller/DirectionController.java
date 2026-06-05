package com.meson.controller;

import com.meson.dto.DirectionRequest;
import com.meson.dto.DirectionResponse;
import com.meson.service.DirectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/directions")
@RequiredArgsConstructor
public class DirectionController {

    private final DirectionService directionService;

    @GetMapping
    public ResponseEntity<List<DirectionResponse>> getAll() {
        return ResponseEntity.ok(directionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DirectionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(directionService.getById(id));
    }

    @PostMapping
    public ResponseEntity<DirectionResponse> create(@Valid @RequestBody DirectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(directionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DirectionResponse> update(@Valid @PathVariable Long id,
                                                    @RequestBody DirectionRequest request) {
        return ResponseEntity.ok(directionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        directionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
