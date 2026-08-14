package com.meson.repository;

import com.meson.entity.Assignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Optional<Assignment> findByLessonId(Long lessonId);

    @EntityGraph(attributePaths = {"lesson"})
    List<Assignment> findByLessonModuleSubjectTeacherId(Long teacherId);

    Optional<Assignment> findByIdAndLessonModuleSubjectTeacherId(Long id, Long teacherId);

    @EntityGraph(attributePaths = {"lesson", "lesson.module", "lesson.module.subject"})
    List<Assignment> findByLessonModuleSubjectIdIn(java.util.Collection<Long> subjectIds);

    long countByLessonModuleSubjectTeacherId(Long teacherId);
}
