package com.meson.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    @JsonIgnore
    private String token;
    private String email;
    private String role;
    @JsonIgnore
    private String refreshToken;
    private Long userId;
    /** True when the user logged in with a temporary password and must set a new one. */
    private boolean mustChangePassword;

    public AuthResponse(String token, String email, String role, String refreshToken, Long userId) {
        this(token, email, role, refreshToken, userId, false);
    }
}
