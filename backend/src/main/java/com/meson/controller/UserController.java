package com.meson.controller;

import com.meson.dto.BulkImportCredential;
import com.meson.dto.BulkImportResponse;
import com.meson.dto.BulkImportRowDTO;
import com.meson.dto.BulkImportRowResult;
import com.meson.dto.UserDTO;
import com.meson.dto.CreateUserDTO;
import com.meson.dto.UpdateUserDTO;
import com.meson.entity.User;
import com.meson.service.BulkImportService;
import com.meson.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;
    private final BulkImportService bulkImportService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/paged")
    public ResponseEntity<org.springframework.data.domain.Page<UserDTO>> getPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String role,
            @RequestParam(defaultValue = "") String status) {
        return ResponseEntity.ok(userService.getPage(search, role, status,
                org.springframework.data.domain.PageRequest.of(page, Math.min(size, 100),
                        org.springframework.data.domain.Sort.by("id"))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody CreateUserDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id,
                                       @RequestBody UpdateUserDTO dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        userService.activate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        userService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-import")
    public ResponseEntity<BulkImportResponse> bulkImport(@RequestParam("file") MultipartFile file) {
        List<BulkImportRowDTO> rows = bulkImportService.parseCsv(file);

        List<BulkImportRowResult> results = rows.stream()
                .map(bulkImportService::importRow)
                .toList();

        List<BulkImportRowResult> failures = results.stream()
                .filter(result -> !result.isSuccess())
                .toList();

        List<BulkImportCredential> credentials = results.stream()
                .filter(result -> result.getTempPassword() != null)
                .map(result -> new BulkImportCredential(
                        result.getRow().getEmri(), result.getRow().getMbiemri(),
                        result.getRow().getEmail(), result.getTempPassword()))
                .toList();

        BulkImportResponse response = new BulkImportResponse(
                results.size(), results.size() - failures.size(), failures.size(), failures, credentials);

        return ResponseEntity.ok(response);
    }
}
