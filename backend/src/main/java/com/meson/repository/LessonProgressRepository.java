package com.meson.repository;

import com.meson.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    boolean existsByStudentIdAndLessonId(Long studentId, Long lessonId);

    @Query("SELECT COUNT(DISTINCT lp.lesson.id) FROM LessonProgress lp " +
           "WHERE lp.student.id = :studentId AND lp.lesson.module.course.id = :courseId")
    long countViewedLessonsByCourse(@Param("studentId") Long studentId,
                                    @Param("courseId")  Long courseId);

    @Query("SELECT COUNT(DISTINCT lp.lesson.id) FROM LessonProgress lp " +
           "WHERE lp.student.id = :studentId AND lp.lesson.module.id = :moduleId")
    long countViewedLessonsByModule(@Param("studentId") Long studentId,
                                    @Param("moduleId")  Long moduleId);
}
