package com.meson.controller;

import com.meson.dto.UserTokenResponse;
import com.meson.service.UserTokenService;
import lombok.RequiredArgsConstructor;
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
}
