package com.meson.repository;

import com.meson.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Optional<Assignment> findByLessonId(Long lessonId);
    List<Assignment> findByLessonModuleCourseTeacherId(Long teacherId);
    Optional<Assignment> findByIdAndLessonModuleCourseTeacherId(Long id, Long teacherId);
    long countByLessonModuleCourseTeacherId(Long teacherId);
}
