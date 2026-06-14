package com.meson.repository;

import com.meson.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmail(String email);
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.userRoles ur JOIN ur.role r WHERE LOWER(r.normalizedName) = LOWER(:role)")
    long countByRole(String role);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.userRoles ur LEFT JOIN FETCH ur.role")
    List<User> findAllWithRoles();

    @Query("SELECT DISTINCT u FROM User u JOIN u.userRoles ur JOIN ur.role r WHERE LOWER(r.normalizedName) = LOWER(:normalizedName)")
    List<User> findAllByRoleNormalizedName(String normalizedName);

    @Query("SELECT DISTINCT u FROM User u WHERE "
            + "(LOWER(u.emri) LIKE CONCAT('%', LOWER(:search), '%') "
            + "OR LOWER(u.mbiemri) LIKE CONCAT('%', LOWER(:search), '%') "
            + "OR LOWER(u.email) LIKE CONCAT('%', LOWER(:search), '%')) "
            + "AND (:role = '' OR EXISTS (SELECT 1 FROM UserRole ur2 WHERE ur2.user = u "
            + "AND LOWER(ur2.role.normalizedName) = LOWER(:role))) "
            + "AND (:status = '' OR LOWER(u.statusi) = LOWER(:status))")
    org.springframework.data.domain.Page<User> searchPage(String search, String role, String status,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u JOIN u.userRoles ur JOIN ur.role r WHERE LOWER(r.normalizedName) = LOWER(:normalizedName) "
            + "AND (LOWER(u.emri) LIKE CONCAT('%', LOWER(:term), '%') "
            + "OR LOWER(u.mbiemri) LIKE CONCAT('%', LOWER(:term), '%') "
            + "OR LOWER(u.email) LIKE CONCAT('%', LOWER(:term), '%'))")
    List<User> searchByRoleNormalizedNameAndTerm(String normalizedName, String term);
}
