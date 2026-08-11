package com.meson.repository;

import com.meson.entity.GradeAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeAuditLogRepository extends JpaRepository<GradeAuditLog, Long> {
    List<GradeAuditLog> findByGradeIdOrderByPerformedAtAsc(Long gradeId);
    Page<GradeAuditLog> findBySubjectIdIn(List<Long> subjectIds, Pageable pageable);
}
