package com.meson.api;

import com.meson.entity.User;
import com.meson.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    public ResponseEntity<?> register(@RequestBody User body) {
        if (userRepository.existsByEmailIgnoreCase(body.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email ekziston tashmë"));
        }

        User user = new User();
        user.setEmail(body.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(body.getPasswordHash()));
        user.setEmri(body.getEmri());
        user.setMbiemri(body.getMbiemri());
        user.setDataKrijimit(LocalDateTime.now());
        user.setStatusi("active");

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("email", user.getEmail()));
    }
}