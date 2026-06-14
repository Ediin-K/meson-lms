package com.meson.repository;

import com.meson.entity.ExamApplication;
import com.meson.entity.ExamApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamApplicationRepository extends JpaRepository<ExamApplication, Long> {

    @EntityGraph(attributePaths = {"student", "course", "course.courseCategory", "professor", "grade"})
    List<ExamApplication> findByStudentIdOrderByAppliedAtDesc(Long studentId);

    @EntityGraph(attributePaths = {"student", "course", "course.courseCategory", "professor", "grade"})
    List<ExamApplication> findByStudentIdAndStatusInOrderByAppliedAtDesc(
            Long studentId,
            Collection<ExamApplicationStatus> statuses);

    @EntityGraph(attributePaths = {"student", "course", "course.courseCategory", "professor", "grade"})
    List<ExamApplication> findByProfessorIdOrderByAppliedAtDesc(Long professorId);

    @EntityGraph(attributePaths = {"student", "course", "course.courseCategory", "professor", "grade"})
    List<ExamApplication> findByStatusOrderByAppliedAtDesc(ExamApplicationStatus status);

    @EntityGraph(attributePaths = {"student", "course", "course.courseCategory", "professor", "grade"})
    List<ExamApplication> findAllByOrderByAppliedAtDesc();

    @EntityGraph(attributePaths = {"student", "course", "course.courseCategory", "professor", "grade"})
    Optional<ExamApplication> findByIdAndStudentId(Long id, Long studentId);

    @EntityGraph(attributePaths = {"student", "course", "course.courseCategory", "professor", "grade"})
    Optional<ExamApplication> findByIdAndProfessorId(Long id, Long professorId);

    boolean existsByStudentIdAndCourseIdAndStatusIn(Long studentId, Long courseId, Collection<ExamApplicationStatus> statuses);
}
