package com.meson.service;

import com.meson.dto.AccountResponse;
import com.meson.dto.UpdateAccountRequest;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Set;

/** Account self-service available to any authenticated user, regardless of role. */
@Service
@RequiredArgsConstructor
public class AccountService {

    private static final Set<String> ALLOWED_IMAGE_EXT = Set.of("png", "jpg", "jpeg", "gif", "webp");
    private static final long MAX_PHOTO_BYTES = 5L * 1024 * 1024;

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    public AccountResponse getCurrentAccount() {
        return toResponse(currentUser());
    }

    @Transactional
    public AccountResponse updateCurrentAccount(UpdateAccountRequest request) {
        User user = currentUser();
        user.setEmri(request.getEmri().trim());
        user.setMbiemri(request.getMbiemri().trim());
        user.setPhoneNumber(request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()
                ? request.getPhoneNumber().trim() : null);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        User user = currentUser();
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Fjalëkalimi aktual është i gabuar");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new RuntimeException("Fjalëkalimi i ri nuk mund të jetë i njëjtë me atë aktual");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public AccountResponse uploadPhoto(MultipartFile file) {
        User user = currentUser();
        validateImage(file);
        // Replace any previous avatar
        deleteStoredPhoto(user);
        String path = fileStorageService.store(file, "avatars/" + user.getId());
        user.setPhotoPath(path);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AccountResponse removePhoto() {
        User user = currentUser();
        deleteStoredPhoto(user);
        user.setPhotoPath(null);
        return toResponse(userRepository.save(user));
    }

    /** Serves a user's avatar. Public so <img> tags can load it. */
    public Resource servePhoto(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet"));
        if (user.getPhotoPath() == null) {
            throw new RuntimeException("Nuk ka foto profili");
        }
        return fileStorageService.loadAsResource(user.getPhotoPath());
    }

    public String photoContentType(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getPhotoPath() == null) return "application/octet-stream";
        String p = user.getPhotoPath().toLowerCase(Locale.ROOT);
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".gif")) return "image/gif";
        if (p.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }

    private void deleteStoredPhoto(User user) {
        if (user.getPhotoPath() != null) {
            try { fileStorageService.delete(user.getPhotoPath()); } catch (Exception ignored) {}
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new RuntimeException("Skedari është bosh");
        if (file.getSize() > MAX_PHOTO_BYTES) throw new RuntimeException("Fotoja nuk mund të kalojë 5 MB");
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        int dot = name.lastIndexOf('.');
        String ext = dot >= 0 ? name.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
        if (!ALLOWED_IMAGE_EXT.contains(ext)) {
            throw new RuntimeException("Lloji i fotos nuk lejohet. Përdorni PNG, JPG, GIF ose WEBP.");
        }
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet"));
    }

    private AccountResponse toResponse(User user) {
        String role = userRoleRepository.findByUser(user).stream()
                .findFirst()
                .map(UserRole::getRole)
                .map(r -> r.getEmertimi() != null ? r.getEmertimi().toLowerCase(Locale.ROOT) : "guest")
                .map(r -> "prind".equals(r) ? "parent" : r)
                .orElse("guest");

        boolean hasPhoto = user.getPhotoPath() != null;
        return AccountResponse.builder()
                .id(user.getId())
                .emri(user.getEmri())
                .mbiemri(user.getMbiemri())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(role)
                .hasPhoto(hasPhoto)
                .photoUrl(hasPhoto ? "/api/account/" + user.getId() + "/photo" : null)
                .build();
    }
}
