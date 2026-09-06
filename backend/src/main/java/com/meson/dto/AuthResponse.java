package com.meson.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AuthResponse {
    @JsonIgnore
    private String token;
    private String email;
    /** Primary (highest-privilege) role — drives the post-login redirect. */
    private String role;
    /** Every role the account holds. */
    private List<String> roles;
    @JsonIgnore
    private String refreshToken;
    private Long userId;
    /** True when the user logged in with a temporary password and must set a new one. */
    private boolean mustChangePassword;

    public AuthResponse(String token, String email, String role, List<String> roles, String refreshToken, Long userId) {
        this(token, email, role, roles, refreshToken, userId, false);
    }
}
