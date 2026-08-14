package com.meson.repository;

import com.meson.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);

    @Query("SELECT sp FROM StudentProfile sp LEFT JOIN FETCH sp.department WHERE sp.user.id IN :userIds")
    List<StudentProfile> findByUserIdIn(@Param("userIds") List<Long> userIds);

    @Query("""
            SELECT sp FROM StudentProfile sp
            LEFT JOIN FETCH sp.department
            LEFT JOIN FETCH sp.approvedDepartmentGroup dg
            LEFT JOIN FETCH dg.department
            WHERE sp.user.id = :userId
            """)
    Optional<StudentProfile> findByUserIdWithDetails(@Param("userId") Long userId);

    void deleteByUserId(Long userId);

    long countByApprovedDepartmentGroupId(Long departmentGroupId);

    /** Approved-student count for many department groups in one grouped query. */
    @Query("SELECT sp.approvedDepartmentGroup.id AS groupId, COUNT(sp) AS studentCount "
            + "FROM StudentProfile sp WHERE sp.approvedDepartmentGroup.id IN :groupIds "
            + "GROUP BY sp.approvedDepartmentGroup.id")
    List<DepartmentGroupStudentCount> countByApprovedDepartmentGroupIdIn(@Param("groupIds") List<Long> groupIds);

    interface DepartmentGroupStudentCount {
        Long getGroupId();
        long getStudentCount();
    }

    @Query("""
            SELECT sp FROM StudentProfile sp
            JOIN FETCH sp.user u
            WHERE sp.approvedDepartmentGroup.id = :groupId
            ORDER BY u.mbiemri, u.emri
            """)
    List<StudentProfile> findMembersByDepartmentGroupId(@Param("groupId") Long groupId);
}
