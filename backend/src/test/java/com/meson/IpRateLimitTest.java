package com.meson;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * IP-based login rate limiting: caps attempts per IP regardless of which account is
 * targeted. A tight threshold via @TestPropertySource gives this class its own
 * isolated Spring context (and its own IpLoginRateLimiter instance), so it can't
 * pollute — or be polluted by — the many unrelated login POSTs elsewhere in the suite.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "rate-limit.login.max-attempts=5",
        "rate-limit.login.window-minutes=15"
})
class IpRateLimitTest {

    @Autowired MockMvc mockMvc;

    private ResultActions attemptLogin(String email) throws Exception {
        return mockMvc.perform(post("/api/auth/login").contentType("application/json")
                .content("{\"email\":\"" + email + "\",\"password\":\"whatever\"}"));
    }

    @Test
    void sixthAttemptFromSameIpIsRateLimitedRegardlessOfAccount() throws Exception {
        // Five attempts against five different (nonexistent) accounts — proves this
        // is IP-scoped, not account-scoped like AuthService's own lockout.
        for (int i = 0; i < 5; i++) {
            attemptLogin("nobody" + i + "@test.com")
                    .andExpect(status().isBadRequest());
        }

        attemptLogin("nobody5@test.com")
                .andExpect(status().isTooManyRequests())
                .andExpect(result -> {
                    String body = result.getResponse().getContentAsString();
                    assertThat(body).contains("\"status\":429");
                    assertThat(body).contains("retryAfterMinutes");
                });
    }
}
