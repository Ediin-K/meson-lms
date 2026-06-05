package com.meson.repository;

import com.meson.entity.DepartmentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentGroupRepository extends JpaRepository<DepartmentGroup, Long> {
    List<DepartmentGroup> findByDepartmentIdOrderByNameAsc(Long departmentId);

    List<DepartmentGroup> findByDepartmentIdAndSemesterOrderByNameAsc(Long departmentId, Integer semester);

    Optional<DepartmentGroup> findByDepartmentIdAndSemesterAndNameIgnoreCase(
            Long departmentId, Integer semester, String name);

    boolean existsByDepartmentIdAndSemesterAndNameIgnoreCase(
            Long departmentId, Integer semester, String name);

    @Query("""
            SELECT dg FROM DepartmentGroup dg
            JOIN FETCH dg.department
            WHERE dg.id = :id
            """)
    java.util.Optional<DepartmentGroup> findByIdWithDepartment(@Param("id") Long id);

    @Query("""
            SELECT dg FROM DepartmentGroup dg
            JOIN FETCH dg.department
            WHERE dg.department.id = :departmentId
            ORDER BY dg.name ASC
            """)
    List<DepartmentGroup> findByDepartmentIdWithDepartment(@Param("departmentId") Long departmentId);

    @Query("""
            SELECT dg FROM DepartmentGroup dg
            JOIN FETCH dg.department
            WHERE dg.department.id = :departmentId AND dg.semester = :semester
            ORDER BY dg.name ASC
            """)
    List<DepartmentGroup> findByDepartmentIdAndSemesterWithDepartment(
            @Param("departmentId") Long departmentId,
            @Param("semester") Integer semester);
}
