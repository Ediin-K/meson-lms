package com.meson.service;

import com.meson.dto.AuthResponse;
import com.meson.dto.LoginRequest;
import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.entity.UserToken;
import com.meson.entity.RefreshToken;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import com.meson.repository.UserTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserTokenRepository userTokenRepository;

    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email ose password gabim"));

        boolean isPasswordValid = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        );

        if (!isPasswordValid) {
            throw new RuntimeException("Email ose password gabim");
        }

        Role role = userRoleRepository.findByUser(user)
                .stream()
                .findFirst()
                .map(UserRole::getRole)
                .orElse(null);

        String roleName = (role != null)
                ? role.getNormalizedName().toUpperCase()
                : "GUEST";

        String roleDisplay = (role != null)
                ? role.getEmertimi().toLowerCase()
                : "guest";

        String token = jwtService.generateToken(user.getEmail(), roleName);

        refreshTokenService.revokeAllUserTokens(user);

        // Ruaj access token-in në user_tokens (replace nëse ekziston)
        userTokenRepository.deleteByUserIdAndLoginProvider(user.getId(), "Local");
        userTokenRepository.save(UserToken.builder()
                .user(user)
                .loginProvider("Local")
                .tokenName("access_token")
                .tokenValue(token)
                .build());

        RefreshToken refreshToken = refreshTokenService.generateRefreshToken(user);

        return new AuthResponse(
                token,
                user.getEmail(),
                roleDisplay,
                refreshToken.getToken(),
                user.getId()
        );
    }
}
