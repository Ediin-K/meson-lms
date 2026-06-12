package com.meson;

import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.repository.RefreshTokenRepository;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TemporaryPasswordFlowTest {

    private String EMAIL;
    private static final String TEMP_PASSWORD = "temporary123";
    private static final String NEW_PASSWORD = "brandNewPass456";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void setUp() {
        EMAIL = "newuser" + System.nanoTime() + "@test.com";
        if (roleRepository.findByEmertimi("student").isEmpty()) {
            Role role = new Role();
            role.setEmertimi("student");
            role.setNormalizedName("student");
            roleRepository.save(role);
        }
    }

    void adminCreatesUser() throws Exception {
        mockMvc.perform(post("/api/users")
                        .with(SecurityMockMvcRequestPostProcessors.user("admin@test.com").roles("ADMIN"))
                        .contentType("application/json")
                        .content("{\"emri\":\"New\",\"mbiemri\":\"User\",\"email\":\"" + EMAIL + "\"," +
                                "\"password\":\"" + TEMP_PASSWORD + "\",\"role\":\"student\"}"))
                .andExpect(status().isCreated());
    }

    private MvcResult login(String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + password + "\"}"))
                .andReturn();
    }

    private Cookie accessCookie(MvcResult res) {
        Cookie c = res.getResponse().getCookie("accessToken");
        assertThat(c).isNotNull();
        return c;
    }

    // 1+2. Admin-created user has temporaryPassword=true and gets a restricted token on login
    @Test
    void adminCreatedUserGetsRestrictedToken() throws Exception {
        adminCreatesUser();

        User user = userRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(user.isTemporaryPassword()).isTrue();

        MvcResult res = login(TEMP_PASSWORD);
        assertThat(res.getResponse().getStatus()).isEqualTo(200);
        assertThat(res.getResponse().getContentAsString()).contains("\"mustChangePassword\":true");
        // no refresh token issued with a temporary password
        Cookie refresh = res.getResponse().getCookie("refreshToken");
        assertThat(refresh == null || refresh.getValue().isEmpty()).isTrue();
    }

    // Restricted token is rejected on all normal authenticated endpoints
    @Test
    void restrictedTokenRejectedOnNormalEndpoints() throws Exception {
        adminCreatesUser();
        Cookie restricted = accessCookie(login(TEMP_PASSWORD));

        mockMvc.perform(get("/api/assignments/my-submissions").cookie(restricted))
                .andExpect(status().is4xxClientError());
        mockMvc.perform(get("/api/users").cookie(restricted))
                .andExpect(status().is4xxClientError());
    }

    // 3+4. Password change flips the flag, issues full token; user can then use normal endpoints
    @Test
    void passwordChangeUnlocksFullAccess() throws Exception {
        adminCreatesUser();
        Cookie restricted = accessCookie(login(TEMP_PASSWORD));

        // wrong current password rejected
        MvcResult bad = mockMvc.perform(post("/api/auth/change-temporary-password")
                        .cookie(restricted)
                        .contentType("application/json")
                        .content("{\"currentPassword\":\"wrong\",\"newPassword\":\"" + NEW_PASSWORD + "\"}"))
                .andReturn();
        assertThat(bad.getResponse().getStatus()).isNotEqualTo(200);

        // same-as-current password rejected
        MvcResult same = mockMvc.perform(post("/api/auth/change-temporary-password")
                        .cookie(restricted)
                        .contentType("application/json")
                        .content("{\"currentPassword\":\"" + TEMP_PASSWORD + "\",\"newPassword\":\"" + TEMP_PASSWORD + "\"}"))
                .andReturn();
        assertThat(same.getResponse().getStatus()).isNotEqualTo(200);

        // valid change succeeds and returns a full-access session
        MvcResult ok = mockMvc.perform(post("/api/auth/change-temporary-password")
                        .cookie(restricted)
                        .contentType("application/json")
                        .content("{\"currentPassword\":\"" + TEMP_PASSWORD + "\",\"newPassword\":\"" + NEW_PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mustChangePassword").value(false))
                .andReturn();

        User user = userRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(user.isTemporaryPassword()).isFalse();

        // full-access token from the change response works on a normal endpoint
        Cookie fullToken = accessCookie(ok);
        mockMvc.perform(get("/api/assignments/my-submissions").cookie(fullToken))
                .andExpect(status().isOk());

        // old temporary password no longer works
        assertThat(login(TEMP_PASSWORD).getResponse().getStatus()).isNotEqualTo(200);

        // fresh login with new password is a normal login with a refresh token
        MvcResult relogin = login(NEW_PASSWORD);
        assertThat(relogin.getResponse().getStatus()).isEqualTo(200);
        assertThat(relogin.getResponse().getContentAsString()).contains("\"mustChangePassword\":false");
        assertThat(relogin.getResponse().getCookie("refreshToken")).isNotNull();
        mockMvc.perform(get("/api/assignments/my-submissions").cookie(accessCookie(relogin)))
                .andExpect(status().isOk());
    }
}
