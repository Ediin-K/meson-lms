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

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 7;
    private static final long LOCKOUT_DURATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserTokenRepository userTokenRepository;

    // noRollbackFor: failed-attempt bookkeeping below must survive even though this
    // method throws on every failure path — default rollback-on-RuntimeException
    // would otherwise undo the counter/lockout before it reaches the database.
    @Transactional(noRollbackFor = RuntimeException.class)
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email ose password gabim"));

        LocalDateTime now = LocalDateTime.now();

        if (user.getLockedUntil() != null) {
            if (user.getLockedUntil().isAfter(now)) {
                long minutesLeft = Duration.between(now, user.getLockedUntil()).toMinutes() + 1;
                throw new RuntimeException(
                        "Llogaria eshte e bllokuar per shkak te shume tentativave te gabuara. Provoni perseri pas "
                                + minutesLeft + " minutash.");
            }
            // Lockout window elapsed - auto-clear, give the account a clean slate
            user.setLockedUntil(null);
            user.setAccessFailedCount(0);
        }

        boolean isPasswordValid = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        );

        if (!isPasswordValid) {
            int failedCount = user.getAccessFailedCount() + 1;
            user.setAccessFailedCount(failedCount);
            if (failedCount >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(now.plusMinutes(LOCKOUT_DURATION_MINUTES));
            }
            userRepository.save(user);
            throw new RuntimeException("Email ose password gabim");
        }

        user.setAccessFailedCount(0);
        user.setLockedUntil(null);
        userRepository.save(user);

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

        if (user.isTemporaryPassword()) {
            // Restricted, short-lived token: only the password-change endpoint accepts it.
            // No refresh token — refreshing would mint a full-access token.
            refreshTokenService.revokeAllUserTokens(user);
            userTokenRepository.deleteByUserIdAndLoginProvider(user.getId(), "Local");
            String restrictedToken = jwtService.generatePasswordChangeToken(user.getEmail());
            return new AuthResponse(restrictedToken, user.getEmail(), roleDisplay, null, user.getId(), true);
        }

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

    /**
     * Changes a temporary password: verifies the current one, applies the new one,
     * clears the temporary flag, rotates all tokens and issues a full-access JWT.
     */
    public AuthResponse changeTemporaryPassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Fjalëkalimi aktual është i gabuar");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new RuntimeException("Fjalëkalimi i ri nuk mund të jetë i njëjtë me atë aktual");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setTemporaryPassword(false);
        userRepository.save(user);

        // Rotate everything: revoke refresh tokens and drop stored access tokens
        refreshTokenService.revokeAllUserTokens(user);
        userTokenRepository.deleteByUserId(user.getId());

        Role role = userRoleRepository.findByUser(user)
                .stream()
                .findFirst()
                .map(UserRole::getRole)
                .orElse(null);
        String roleName = (role != null) ? role.getNormalizedName().toUpperCase() : "GUEST";
        String roleDisplay = (role != null) ? role.getEmertimi().toLowerCase() : "guest";

        String token = jwtService.generateToken(user.getEmail(), roleName);
        userTokenRepository.save(UserToken.builder()
                .user(user)
                .loginProvider("Local")
                .tokenName("access_token")
                .tokenValue(token)
                .build());

        RefreshToken refreshToken = refreshTokenService.generateRefreshToken(user);

        return new AuthResponse(token, user.getEmail(), roleDisplay, refreshToken.getToken(), user.getId(), false);
    }
}
