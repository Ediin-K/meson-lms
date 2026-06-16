package com.meson.controller;

import com.meson.dto.AccountResponse;
import com.meson.dto.ChangePasswordRequest;
import com.meson.dto.UpdateAccountRequest;
import com.meson.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.concurrent.TimeUnit;

/** Self-service account management for the authenticated user (any role). */
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/me")
    public ResponseEntity<AccountResponse> me() {
        return ResponseEntity.ok(accountService.getCurrentAccount());
    }

    @PatchMapping("/me")
    public ResponseEntity<AccountResponse> updateMe(@Valid @RequestBody UpdateAccountRequest request) {
        return ResponseEntity.ok(accountService.updateCurrentAccount(request));
    }

    @PostMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        accountService.changePassword(request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Fjalëkalimi u ndryshua me sukses"));
    }

    @PostMapping("/photo")
    public ResponseEntity<AccountResponse> uploadPhoto(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(accountService.uploadPhoto(file));
    }

    @DeleteMapping("/photo")
    public ResponseEntity<AccountResponse> removePhoto() {
        return ResponseEntity.ok(accountService.removePhoto());
    }

    /** Public so it can be used directly as an <img> src. */
    @GetMapping("/{userId}/photo")
    public ResponseEntity<Resource> photo(@PathVariable Long userId) {
        Resource resource = accountService.servePhoto(userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(accountService.photoContentType(userId)))
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePrivate())
                .body(resource);
    }
}
