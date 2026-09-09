package com.meson.repository;

import com.meson.entity.AssistantReview;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssistantReviewRepository extends JpaRepository<AssistantReview, Long> {

    /** One assistant's full log for one student in one subject, newest dated entry first, final row included. */
    @EntityGraph(attributePaths = {"student", "assistant"})
    List<AssistantReview> findByAssistantIdAndSubjectIdAndStudentIdOrderByReviewDateDesc(
            Long assistantId, Long subjectId, Long studentId);

    /** Teacher-side view: every assistant's reviews for one student in one subject. */
    @EntityGraph(attributePaths = {"assistant"})
    List<AssistantReview> findBySubjectIdAndStudentId(Long subjectId, Long studentId);

    /** Roster summary: all of one assistant's reviews across one subject. */
    List<AssistantReview> findByAssistantIdAndSubjectId(Long assistantId, Long subjectId);

    /** Upsert lookup for the single final review. */
    Optional<AssistantReview> findByAssistantIdAndSubjectIdAndStudentIdAndReviewDateIsNull(
            Long assistantId, Long subjectId, Long studentId);

    void deleteByAssistantId(Long assistantId);

    void deleteByStudentId(Long studentId);
}
