package com.meson.repository;

import com.meson.entity.SubjectGroup;
import com.meson.entity.DepartmentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectGroupRepository extends JpaRepository<SubjectGroup, Long> {
    List<SubjectGroup> findBySubjectId(Long subjectId);
    List<SubjectGroup> findByDepartmentGroupId(Long departmentGroupId);
    boolean existsBySubjectIdAndNameIgnoreCase(Long subjectId, String name);

    @Query("""
            SELECT DISTINCT sg.departmentGroup FROM SubjectGroup sg
            WHERE sg.subject.department.id = :departmentId
              AND sg.departmentGroup IS NOT NULL
            ORDER BY sg.departmentGroup.name ASC
            """)
    List<DepartmentGroup> findDistinctDepartmentGroupsByDepartmentId(@Param("departmentId") Long departmentId);
}
