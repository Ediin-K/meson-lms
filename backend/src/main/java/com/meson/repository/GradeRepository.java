package com.meson.repository;

import com.meson.entity.Grade;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    @EntityGraph(attributePaths = {"student", "subject", "professor"})
    List<Grade> findByStudentId(Long studentId);

    @EntityGraph(attributePaths = {"student", "subject", "professor"})
    List<Grade> findBySubjectId(Long subjectId);

    @EntityGraph(attributePaths = {"student", "subject", "professor"})
    Optional<Grade> findByIdAndSubjectTeacherId(Long id, Long teacherId);

    @EntityGraph(attributePaths = {"student", "subject", "professor"})
    List<Grade> findBySubjectTeacherId(Long teacherId);

    boolean existsByStudentIdAndSubjectId(Long studentId, Long subjectId);

    Optional<Grade> findByStudentIdAndSubjectId(Long studentId, Long subjectId);

    void deleteByStudentId(Long studentId);

    void deleteByProfessorId(Long professorId);
}
