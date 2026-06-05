package com.meson.repository;

import com.meson.entity.GroupRequestStatus;
import com.meson.entity.StudentGroupRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentGroupRequestRepository extends JpaRepository<StudentGroupRequest, Long> {
    Optional<StudentGroupRequest> findByStudentIdAndStatus(Long studentId, GroupRequestStatus status);
    boolean existsByStudentIdAndStatus(Long studentId, GroupRequestStatus status);
    List<StudentGroupRequest> findByStudentIdOrderByAppliedAtDesc(Long studentId);

    void deleteByStudentId(Long studentId);

    void deleteByApprovedById(Long approvedById);

    @Query("""
            SELECT r FROM StudentGroupRequest r
            JOIN FETCH r.student s
            JOIN FETCH r.departmentGroup dg
            JOIN FETCH dg.department c
            WHERE (:status IS NULL OR r.status = :status)
              AND (:departmentId IS NULL OR c.id = :departmentId)
              AND (:departmentGroupId IS NULL OR dg.id = :departmentGroupId)
            ORDER BY r.appliedAt DESC
            """)
    List<StudentGroupRequest> findAdminRequests(
            @Param("status") GroupRequestStatus status,
            @Param("departmentId") Long departmentId,
            @Param("departmentGroupId") Long departmentGroupId);
}
