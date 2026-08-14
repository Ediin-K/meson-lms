package com.meson.repository;

import com.meson.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    boolean existsByStudentIdAndLessonId(Long studentId, Long lessonId);

    void deleteByStudentId(Long studentId);

    @Query("SELECT COUNT(DISTINCT lp.lesson.id) FROM LessonProgress lp " +
           "WHERE lp.student.id = :studentId AND lp.lesson.module.subject.id = :subjectId")
    long countViewedLessonsBySubject(@Param("studentId") Long studentId,
                                    @Param("subjectId")  Long subjectId);

    @Query("SELECT COUNT(DISTINCT lp.lesson.id) FROM LessonProgress lp " +
           "WHERE lp.student.id = :studentId AND lp.lesson.module.id = :moduleId")
    long countViewedLessonsByModule(@Param("studentId") Long studentId,
                                    @Param("moduleId")  Long moduleId);

    /** Same as countViewedLessonsByModule, batched across many modules: one query instead of one per module. */
    @Query("SELECT lp.lesson.module.id AS moduleId, COUNT(DISTINCT lp.lesson.id) AS viewedCount "
            + "FROM LessonProgress lp WHERE lp.student.id = :studentId AND lp.lesson.module.id IN :moduleIds "
            + "GROUP BY lp.lesson.module.id")
    List<ModuleViewedCount> countViewedLessonsByModuleIn(@Param("studentId") Long studentId,
                                    @Param("moduleIds") List<Long> moduleIds);

    interface ModuleViewedCount {
        Long getModuleId();
        long getViewedCount();
    }
}
