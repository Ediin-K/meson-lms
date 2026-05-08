package com.meson.repository;

import com.meson.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByCourseIdOrderByRradhitjaAsc(Long courseId);
    List<Module> findByCourseId(Long courseId);
    boolean existsByTitulliAndCourseId(String titulli,Long courseId);
    void deleteAllByCourseId(Long courseId);
}