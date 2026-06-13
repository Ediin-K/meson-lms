package com.meson.repository;

import com.meson.entity.SubjectSubgroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectSubgroupRepository extends JpaRepository<SubjectSubgroup, Long> {
    List<SubjectSubgroup> findBySubjectGroupId(Long subjectGroupId);
    boolean existsBySubjectGroupIdAndNameIgnoreCase(Long subjectGroupId, String name);
}
