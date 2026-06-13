package com.meson.controller;

import com.meson.dto.UserClaimRequest;
import com.meson.dto.UserClaimResponse;
import com.meson.service.UserClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-claims")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserClaimController {

    private final UserClaimService userClaimService;

    @GetMapping
    public ResponseEntity<List<UserClaimResponse>> getAll() {
        return ResponseEntity.ok(userClaimService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserClaimResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userClaimService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserClaimResponse>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(userClaimService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<UserClaimResponse> create(@Valid @RequestBody UserClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userClaimService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserClaimResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody UserClaimRequest request) {
        return ResponseEntity.ok(userClaimService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userClaimService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
