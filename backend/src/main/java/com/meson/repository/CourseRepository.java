package com.meson.repository;

import com.meson.entity.Course;
import com.meson.entity.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByTitulli(String titulli);

    List<Course> findByStatusi(CourseStatus statusi);

    List<Course> findByCategoryIdAndStatusi(Long categoryId, CourseStatus statusi);

    List<Course> findByTeacherId(Long teacherId);

    List<Course> findByTitulliContainingIgnoreCase(String titulli);

    boolean existsByTitulli(String titulli);
}