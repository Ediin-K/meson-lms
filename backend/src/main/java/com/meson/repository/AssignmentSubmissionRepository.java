package com.meson.repository;

import com.meson.entity.AssignmentSubmission;
import com.meson.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    List<AssignmentSubmission> findByStudentId(Long studentId);
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    boolean existsByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    List<AssignmentSubmission> findByAssignmentIdAndStatusi(Long assignmentId, SubmissionStatus statusi);
}