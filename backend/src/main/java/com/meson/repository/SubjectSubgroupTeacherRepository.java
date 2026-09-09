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

    /** Every subgroup a teacher assists on, with the subgroup → group → subject chain loaded. */
    @EntityGraph(attributePaths = {
            "subjectSubgroup",
            "subjectSubgroup.subjectGroup",
            "subjectSubgroup.subjectGroup.subject"
    })
    List<SubjectSubgroupTeacher> findByTeacherId(Long teacherId);

    void deleteBySubjectSubgroupId(Long subjectSubgroupId);
    void deleteByTeacherId(Long teacherId);
}
