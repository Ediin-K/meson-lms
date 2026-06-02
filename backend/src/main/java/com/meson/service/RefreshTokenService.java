package com.meson.service;

import com.meson.dto.AuthResponse;
import com.meson.dto.RefreshTokenRequest;
import com.meson.entity.RefreshToken;
import com.meson.entity.User;
import com.meson.entity.UserToken;
import com.meson.repository.RefreshTokenRepository;
import com.meson.repository.UserTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserTokenRepository userTokenRepository;
    private final JwtService jwtService;

    public RefreshToken generateRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .created(LocalDateTime.now())
                .expires(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {

        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token nuk u gjet"));

        if (refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh token eshte invaliduar");
        }

        if (refreshToken.getExpires().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token ka skaduar — logohu perseri");
        }

        User user = refreshToken.getUser();

        revokeAllUserTokens(user);

        String role = user.getUserRoles()
                .stream()
                .findFirst()
                .map(ur -> ur.getRole().getEmertimi().toLowerCase())
                .orElse("guest");

        String normalizedRole = user.getUserRoles()
                .stream()
                .findFirst()
                .map(ur -> ur.getRole().getNormalizedName().toUpperCase())
                .orElse("GUEST");

        String newAccessToken = jwtService.generateToken(user.getEmail(), normalizedRole);

        // Përditëso access token-in në user_tokens
        userTokenRepository.deleteByUserIdAndLoginProvider(user.getId(), "Local");
        userTokenRepository.save(UserToken.builder()
                .user(user)
                .loginProvider("Local")
                .tokenName("access_token")
                .tokenValue(newAccessToken)
                .build());

        RefreshToken newRefreshToken = generateRefreshToken(user);

        return new AuthResponse(newAccessToken, user.getEmail(), role, newRefreshToken.getToken(), user.getId());
    }

    public void logout(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Token nuk u gjet"));
        User user = refreshToken.getUser();
        revokeAllUserTokens(user);
        // Fshi access token-in nga user_tokens në logout
        userTokenRepository.deleteByUserId(user.getId());
    }

    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.findByUser(user)
                .forEach(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }
}
