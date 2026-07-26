package com.meson.controller;

import com.meson.dto.AdminStatsDTO;
import com.meson.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminStatsService adminStatsService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminStatsService.getStats());
    }
}
