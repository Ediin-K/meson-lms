package com.meson.controller;

import com.meson.dto.UserTokenRequest;
import com.meson.dto.UserTokenResponse;
import com.meson.service.UserTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-tokens")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserTokenController {

    private final UserTokenService userTokenService;

    @GetMapping
    public ResponseEntity<List<UserTokenResponse>> getAll() {
        return ResponseEntity.ok(userTokenService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserTokenResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userTokenService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserTokenResponse>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(userTokenService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<UserTokenResponse> create(@Valid @RequestBody UserTokenRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userTokenService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserTokenResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody UserTokenRequest request) {
        return ResponseEntity.ok(userTokenService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userTokenService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
