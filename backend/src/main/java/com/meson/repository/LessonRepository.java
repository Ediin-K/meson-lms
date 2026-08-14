package com.meson.repository;

import com.meson.entity.Lesson;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    @EntityGraph(attributePaths = {"module"})
    List<Lesson> findByModuleIdOrderByRradhitjaAsc(Long moduleId);
    boolean existsByTitulliAndModuleId(String titulli, Long moduleId);
    void deleteAllByModuleId(Long moduleId);

    List<Lesson> findByModuleSubjectTeacherId(Long teacherId);
    Optional<Lesson> findByIdAndModuleSubjectTeacherId(Long id, Long teacherId);
    long countByModuleId(Long moduleId);
    long countByModuleSubjectId(Long subjectId);

    /** Lesson count for many modules in one grouped query, instead of one count per module. */
    @Query("SELECT l.module.id AS moduleId, COUNT(l) AS lessonCount "
            + "FROM Lesson l WHERE l.module.id IN :moduleIds GROUP BY l.module.id")
    List<ModuleLessonCount> countByModuleIdIn(@Param("moduleIds") List<Long> moduleIds);

    interface ModuleLessonCount {
        Long getModuleId();
        long getLessonCount();
    }
}
