package com.meson.repository;

import com.meson.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {
    void deleteByUserId(Long userId);
    void deleteByUserIdAndLoginProvider(Long userId, String loginProvider);
}
