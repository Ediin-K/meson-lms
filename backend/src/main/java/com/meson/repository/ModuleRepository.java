package com.meson.repository;

import com.meson.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findBySubjectIdOrderByRradhitjaAsc(Long subjectId);
    List<Module> findBySubjectId(Long subjectId);
    long countBySubjectId(Long subjectId);

    /** Module count for many subjects in one grouped query, instead of one count per subject. */
    @Query("SELECT m.subject.id AS subjectId, COUNT(m) AS moduleCount "
            + "FROM Module m WHERE m.subject.id IN :subjectIds GROUP BY m.subject.id")
    List<SubjectModuleCount> countBySubjectIdIn(@Param("subjectIds") List<Long> subjectIds);

    interface SubjectModuleCount {
        Long getSubjectId();
        long getModuleCount();
    }
    boolean existsByTitulliAndSubjectId(String titulli,Long subjectId);
    void deleteAllBySubjectId(Long subjectId);

    List<Module> findBySubjectTeacherId(Long teacherId);
    Optional<Module> findByIdAndSubjectTeacherId(Long id, Long teacherId);
    List<Module> findBySubjectIdAndSubjectTeacherId(Long subjectId, Long teacherId);
}
