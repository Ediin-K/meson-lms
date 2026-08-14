package com.meson.repository;

import com.meson.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    @EntityGraph(attributePaths = {"student", "assignment", "assignment.lesson"})
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);

    @EntityGraph(attributePaths = {"student", "assignment", "assignment.lesson"})
    List<AssignmentSubmission> findByStudentId(Long studentId);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    boolean existsByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    void deleteByStudentId(Long studentId);
}
