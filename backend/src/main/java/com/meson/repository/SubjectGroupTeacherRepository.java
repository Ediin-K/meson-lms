package com.meson.repository;

import com.meson.entity.SubjectGroupTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectGroupTeacherRepository extends JpaRepository<SubjectGroupTeacher, Long> {
    List<SubjectGroupTeacher> findBySubjectGroupId(Long subjectGroupId);
    boolean existsBySubjectGroupIdAndTeacherId(Long subjectGroupId, Long teacherId);
    void deleteBySubjectGroupId(Long subjectGroupId);
    void deleteByTeacherId(Long teacherId);
}
