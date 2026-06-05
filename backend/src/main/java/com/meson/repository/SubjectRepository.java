package com.meson.repository;

import com.meson.entity.Subject;
import com.meson.entity.SubjectStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByTitulli(String titulli);
    List<Subject> findByStatusi(SubjectStatus statusi);
    List<Subject> findByDepartmentIdAndStatusi(Long departmentId, SubjectStatus statusi);

    @EntityGraph(attributePaths = {"teacher", "department"})
    List<Subject> findByTeacherId(Long teacherId);

    List<Subject> findByTitulliContainingIgnoreCase(String titulli);
    List<Subject> findBySemester(Integer semester);
    List<Subject> findByDepartmentIdAndSemester(Long departmentId, Integer semester);
    boolean existsByTitulli(String titulli);

    long countByTeacherId(Long teacherId);
    Optional<Subject> findByIdAndTeacherId(Long id, Long teacherId);
}
