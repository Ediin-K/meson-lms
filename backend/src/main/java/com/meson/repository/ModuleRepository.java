package com.meson.repository;

import com.meson.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findBySubjectIdOrderByRradhitjaAsc(Long subjectId);
    List<Module> findBySubjectId(Long subjectId);
    long countBySubjectId(Long subjectId);
    boolean existsByTitulliAndSubjectId(String titulli,Long subjectId);
    void deleteAllBySubjectId(Long subjectId);

    List<Module> findBySubjectTeacherId(Long teacherId);
    Optional<Module> findByIdAndSubjectTeacherId(Long id, Long teacherId);
    List<Module> findBySubjectIdAndSubjectTeacherId(Long subjectId, Long teacherId);
}
