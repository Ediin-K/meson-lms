package com.meson.repository;

import com.meson.entity.SubjectTeacher;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectTeacherRepository extends JpaRepository<SubjectTeacher, Long> {

    @EntityGraph(attributePaths = {"teacher"})
    List<SubjectTeacher> findBySubjectIdOrderBySortOrder(Long subjectId);

    @EntityGraph(attributePaths = {"teacher"})
    List<SubjectTeacher> findBySubjectIdInOrderBySubjectIdAscSortOrderAsc(List<Long> subjectIds);

    @EntityGraph(attributePaths = {"subject", "subject.department"})
    List<SubjectTeacher> findByTeacherId(Long teacherId);

    boolean existsBySubjectIdAndTeacherId(Long subjectId, Long teacherId);

    long countBySubjectId(Long subjectId);

    void deleteBySubjectId(Long subjectId);

    void deleteByTeacherId(Long teacherId);
}
