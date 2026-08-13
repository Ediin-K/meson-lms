package com.meson.repository;

import com.meson.entity.SubjectSubgroupTeacher;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectSubgroupTeacherRepository extends JpaRepository<SubjectSubgroupTeacher, Long> {
    List<SubjectSubgroupTeacher> findBySubjectSubgroupId(Long subjectSubgroupId);

    @EntityGraph(attributePaths = {"teacher"})
    List<SubjectSubgroupTeacher> findBySubjectSubgroupIdIn(List<Long> subjectSubgroupIds);
    void deleteBySubjectSubgroupId(Long subjectSubgroupId);
    void deleteByTeacherId(Long teacherId);
}
