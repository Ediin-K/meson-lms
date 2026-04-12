package com.meson.service;

import com.meson.dto.AuthResponse;
import com.meson.dto.LoginRequest;
import com.meson.dto.RegisterRequest;
import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {

        // 1. Kontrollo nëse email ekziston
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email ekziston tashmë!");
        }

        // 2. Krijo userin e ri
        User user = new User();
        user.setEmri(request.getEmri());
        user.setMbiemri(request.getMbiemri());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDataKrijimit(LocalDateTime.now());
        user.setStatusi("active");

        // 3. Ruaj userin në DB
        userRepository.save(user);

        // 4. Gjej rolin nga DB
        Role role = roleRepository.findByNormalizedName(
                request.getRoli().toUpperCase()
        ).orElseThrow(() -> new RuntimeException("Roli nuk u gjet!"));

        // 5. Krijo lidhjen UserRole
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        // 6. Gjenero token dhe kthe AuthResponse
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {

        // 1. Gjej userin nga email
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Email nuk ekziston!"));

        // 2. Kontrollo passwordin
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Password i gabuar!");
        }

        // 3. Gjenero token dhe kthe AuthResponse
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }
}