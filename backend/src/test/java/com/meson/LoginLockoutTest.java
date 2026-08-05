package com.meson;

import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Account lockout after repeated failed logins: locks, auto-clears, resets on success. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoginLockoutTest {

    private static final String EMAIL = "lockouttest@test.com";
    private static final String PASSWORD = "password123";
    private static final String WRONG_PASSWORD = "wrongpassword";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRoleRepository userRoleRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.findByEmail(EMAIL).ifPresent(userRepository::delete);

        User u = new User();
        u.setEmri("Lockout");
        u.setMbiemri("Test");
        u.setEmail(EMAIL);
        u.setPasswordHash(passwordEncoder.encode(PASSWORD));
        u = userRepository.save(u);

        Role studentRole = roleRepository.findByEmertimi("student").orElseGet(() ->
                roleRepository.save(Role.builder()
                        .emertimi("student")
                        .pershkrimi("Student")
                        .normalizedName("STUDENT")
                        .build()));

        userRoleRepository.save(UserRole.builder().user(u).role(studentRole).build());
    }

    private ResultActions attemptLogin(String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login").contentType("application/json")
                .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + password + "\"}"));
    }

    @Test
    void sevenWrongAttemptsLocksAccountEvenWithCorrectPasswordAfterward() throws Exception {
        for (int i = 0; i < 7; i++) {
            attemptLogin(WRONG_PASSWORD).andExpect(status().isBadRequest());
        }

        User locked = userRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(locked.getAccessFailedCount()).isEqualTo(7);
        assertThat(locked.getLockedUntil()).isAfter(LocalDateTime.now());

        // Correct password no longer works while locked - proves the lock check
        // runs before the password check, not just an extra failed attempt.
        mockMvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).contains("bllokuar"));
    }

    @Test
    void lockoutAutoClearsOnceWindowElapses() throws Exception {
        for (int i = 0; i < 7; i++) {
            attemptLogin(WRONG_PASSWORD);
        }

        // Simulate the 15-minute window already having passed.
        User locked = userRepository.findByEmail(EMAIL).orElseThrow();
        locked.setLockedUntil(LocalDateTime.now().minusMinutes(1));
        userRepository.save(locked);

        mockMvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk());

        User cleared = userRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(cleared.getAccessFailedCount()).isZero();
        assertThat(cleared.getLockedUntil()).isNull();
    }

    @Test
    void successfulLoginResetsFailedCount() throws Exception {
        for (int i = 0; i < 3; i++) {
            attemptLogin(WRONG_PASSWORD);
        }

        User midway = userRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(midway.getAccessFailedCount()).isEqualTo(3);

        mockMvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk());

        User afterSuccess = userRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(afterSuccess.getAccessFailedCount()).isZero();
        assertThat(afterSuccess.getLockedUntil()).isNull();
    }
}
