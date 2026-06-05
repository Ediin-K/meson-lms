package com.meson.repository;

import com.meson.entity.SubjectGroup;
import com.meson.entity.DirectionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectGroupRepository extends JpaRepository<SubjectGroup, Long> {
    List<SubjectGroup> findBySubjectId(Long subjectId);
    List<SubjectGroup> findByDirectionGroupId(Long directionGroupId);
    boolean existsBySubjectIdAndNameIgnoreCase(Long subjectId, String name);

    @Query("""
            SELECT DISTINCT sg.directionGroup FROM SubjectGroup sg
            WHERE sg.subject.direction.id = :directionId
              AND sg.directionGroup IS NOT NULL
            ORDER BY sg.directionGroup.name ASC
            """)
    List<DirectionGroup> findDistinctDirectionGroupsByDirectionId(@Param("directionId") Long directionId);
}
