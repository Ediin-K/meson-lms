package com.meson;

import com.meson.entity.User;
import com.meson.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Universal account self-service: profile read/update, password change, avatar upload/serve/remove. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AccountApiTest {

    private static final String EMAIL = "acct@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private Long userId;

    @BeforeEach
    void setUp() {
        userRepository.findByEmail(EMAIL).ifPresent(userRepository::delete);
        User u = new User();
        u.setEmri("Acc"); u.setMbiemri("Ount"); u.setEmail(EMAIL);
        u.setPasswordHash(passwordEncoder.encode("oldpassword"));
        userId = userRepository.save(u).getId();
    }

    @Test
    @WithMockUser(username = EMAIL)
    void getAndUpdateProfile() throws Exception {
        mockMvc.perform(get("/api/account/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.hasPhoto").value(false));

        mockMvc.perform(patch("/api/account/me").contentType("application/json")
                .content("{\"emri\":\"New\",\"mbiemri\":\"Name\",\"phoneNumber\":\"+38344123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emri").value("New"))
                .andExpect(jsonPath("$.phoneNumber").value("+38344123"));

        assertThat(userRepository.findByEmail(EMAIL).orElseThrow().getEmri()).isEqualTo("New");
    }

    @Test
    @WithMockUser(username = EMAIL)
    void changePasswordRules() throws Exception {
        // wrong current password
        mockMvc.perform(post("/api/account/password").contentType("application/json")
                .content("{\"currentPassword\":\"wrong\",\"newPassword\":\"newpassword1\"}"))
                .andExpect(status().is4xxClientError());

        // too short
        mockMvc.perform(post("/api/account/password").contentType("application/json")
                .content("{\"currentPassword\":\"oldpassword\",\"newPassword\":\"short\"}"))
                .andExpect(status().is4xxClientError());

        // valid change
        mockMvc.perform(post("/api/account/password").contentType("application/json")
                .content("{\"currentPassword\":\"oldpassword\",\"newPassword\":\"newpassword1\"}"))
                .andExpect(status().isOk());

        assertThat(passwordEncoder.matches("newpassword1",
                userRepository.findByEmail(EMAIL).orElseThrow().getPasswordHash())).isTrue();
    }

    @Test
    @WithMockUser(username = EMAIL)
    void uploadServeAndRemovePhoto() throws Exception {
        MockMultipartFile img = new MockMultipartFile(
                "file", "avatar.png", "image/png", new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47});

        mockMvc.perform(multipart("/api/account/photo").file(img))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasPhoto").value(true))
                .andExpect(jsonPath("$.photoUrl").value("/api/account/" + userId + "/photo"));

        // public serve
        mockMvc.perform(get("/api/account/" + userId + "/photo"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("image/png"));

        // disallowed type rejected
        MockMultipartFile bad = new MockMultipartFile("file", "x.exe", "application/octet-stream", new byte[]{1});
        mockMvc.perform(multipart("/api/account/photo").file(bad))
                .andExpect(status().is4xxClientError());

        // remove
        mockMvc.perform(delete("/api/account/photo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasPhoto").value(false));
    }

    @Test
    void unauthenticatedCannotReadAccount() throws Exception {
        mockMvc.perform(get("/api/account/me"))
                .andExpect(status().is4xxClientError());
    }
}
