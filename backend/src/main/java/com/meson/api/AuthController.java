package com.meson.api;

import com.meson.dto.RegisterRequest;
import com.meson.user.User;
import com.meson.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest body) {
        String email = body.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists"));
        }

        Instant now = Instant.now();
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(body.getPassword()));
        user.setFirstName(body.getFirstName().trim());
        user.setLastName(body.getLastName().trim());
        user.setRole(body.getRole().trim().toLowerCase());
        user.setTermsAccepted(Boolean.TRUE.equals(body.getTermsAccepted()));
        user.setTermsAcceptedAt(now);
        user.setTermsVersion(body.getTermsVersion().trim());
        user.setCreatedAt(now);

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "termsAcceptedAt", user.getTermsAcceptedAt().toString(),
                        "termsVersion", user.getTermsVersion()));
    }
}
