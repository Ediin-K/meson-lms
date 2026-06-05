package com.meson.repository;

import com.meson.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleIdOrderByRradhitjaAsc(Long moduleId);
    boolean existsByTitulliAndModuleId(String titulli, Long moduleId);
    void deleteAllByModuleId(Long moduleId);

    List<Lesson> findByModuleSubjectTeacherId(Long teacherId);
    Optional<Lesson> findByIdAndModuleSubjectTeacherId(Long id, Long teacherId);
    long countByModuleId(Long moduleId);
    long countByModuleSubjectId(Long subjectId);
}
