package com.meson.controller;

import com.meson.dto.DirectionRequest;
import com.meson.dto.DirectionResponse;
import com.meson.service.DirectionCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/subject-directions")
@RequiredArgsConstructor
public class DirectionCategoryController {

    private final DirectionCategoryService directionCategoryService;

    @GetMapping
    public ResponseEntity<List<DirectionResponse>> getAll() {
        return ResponseEntity.ok(directionCategoryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DirectionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(directionCategoryService.getById(id));
    }

    @PostMapping
    public ResponseEntity<DirectionResponse> create(@Valid @RequestBody DirectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(directionCategoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DirectionResponse> update(@Valid @PathVariable Long id,
                                                    @RequestBody DirectionRequest request) {
        return ResponseEntity.ok(directionCategoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        directionCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
