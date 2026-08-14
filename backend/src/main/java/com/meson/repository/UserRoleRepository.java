package com.meson.repository;

import com.meson.entity.User;
import com.meson.entity.Role;
import com.meson.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    List<UserRole> findByUser(User user);

    List<UserRole> findByRole(Role role);

    boolean existsByUserAndRole(User user, Role role);

    java.util.Optional<UserRole> findByUserAndRole(User user, Role role);

    /** Role names for many users in one query, instead of a lazy per-row load. */
    @Query("SELECT ur.user.id AS userId, ur.role.emertimi AS roleName FROM UserRole ur WHERE ur.user.id IN :userIds")
    List<UserRoleName> findByUserIdIn(@Param("userIds") List<Long> userIds);

    interface UserRoleName {
        Long getUserId();
        String getRoleName();
    }
}
