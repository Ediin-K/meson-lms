package com.meson.repository;

import com.meson.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {
    List<UserToken> findByUserId(Long userId);
    void deleteByUserId(Long userId);
    void deleteByUserIdAndLoginProvider(Long userId, String loginProvider);
}
