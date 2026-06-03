package com.meson.repository;

import com.meson.entity.UserClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserClaimRepository extends JpaRepository<UserClaim, Long> {
    List<UserClaim> findByUserId(Long userId);
}
