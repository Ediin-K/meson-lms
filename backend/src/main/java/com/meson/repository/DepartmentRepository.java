package com.meson.repository;

import com.meson.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByEmertimi(String emertimi);
    boolean existsByEmertimi(String emertimi);
    Optional<Department> findByHeadId(Long headId);

    /** Unassign a user as department head before deleting them (departments.head_user_id FK is RESTRICT). */
    @Modifying
    @Query("UPDATE Department d SET d.head = null WHERE d.head.id = :userId")
    void clearHeadByUserId(@Param("userId") Long userId);
}
