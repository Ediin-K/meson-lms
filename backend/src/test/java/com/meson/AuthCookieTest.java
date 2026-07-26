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
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** A normal login must set both accessToken and refreshToken cookies. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthCookieTest {

    private static final String EMAIL = "cookietest@test.com";
    private static final String PASSWORD = "password123";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRoleRepository userRoleRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.findByEmail(EMAIL).ifPresent(userRepository::delete);

        User u = new User();
        u.setEmri("Cookie");
        u.setMbiemri("Test");
        u.setEmail(EMAIL);
        u.setPasswordHash(passwordEncoder.encode(PASSWORD));
        u = userRepository.save(u);

        Role adminRole = roleRepository.findByEmertimi("admin").orElseGet(() ->
                roleRepository.save(Role.builder()
                        .emertimi("admin")
                        .pershkrimi("Admin")
                        .normalizedName("ADMIN")
                        .build()));

        userRoleRepository.save(UserRole.builder().user(u).role(adminRole).build());
    }

    @Test
    void loginSetsBothAccessAndRefreshTokenCookies() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn();

        List<String> setCookieHeaders = result.getResponse().getHeaders("Set-Cookie");
        assertThat(setCookieHeaders).hasSize(2);
        assertThat(setCookieHeaders.toString()).contains("accessToken=");
        assertThat(setCookieHeaders.toString()).contains("refreshToken=");
    }
}
