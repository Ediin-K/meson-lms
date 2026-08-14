package com.meson.repository;

import com.meson.entity.Enrollment;
import com.meson.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    @Override
    @EntityGraph(attributePaths = {"user", "subject", "subject.teacher", "subjectGroup", "subjectSubgroup"})
    List<Enrollment> findAll();

    @EntityGraph(attributePaths = {"user", "subject", "subject.teacher", "subjectGroup", "subjectSubgroup"})
    List<Enrollment> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "subject", "subject.teacher", "subjectGroup", "subjectSubgroup"})
    List<Enrollment> findBySubjectId(Long subjectId);

    @EntityGraph(attributePaths = {"subject"})
    List<Enrollment> findByUserIdAndStatusi(Long userId, EnrollmentStatus statusi);
    Optional<Enrollment> findByUserIdAndSubjectId(Long userId, Long subjectId);
    boolean existsByUserIdAndSubjectId(Long userId, Long subjectId);

    @EntityGraph(attributePaths = {"user", "subject", "subject.teacher", "subjectGroup", "subjectSubgroup"})
    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e WHERE "
            + "(LOWER(e.user.emri) LIKE CONCAT('%', LOWER(:search), '%') "
            + "OR LOWER(e.user.mbiemri) LIKE CONCAT('%', LOWER(:search), '%') "
            + "OR LOWER(e.user.email) LIKE CONCAT('%', LOWER(:search), '%') "
            + "OR LOWER(e.subject.titulli) LIKE CONCAT('%', LOWER(:search), '%')) "
            + "AND (:status IS NULL OR e.statusi = :status)")
    org.springframework.data.domain.Page<Enrollment> searchPage(String search, EnrollmentStatus status,
            org.springframework.data.domain.Pageable pageable);

    @EntityGraph(attributePaths = {"user", "subject"})
    List<Enrollment> findBySubjectTeacherId(Long teacherId);
    long countBySubjectTeacherId(Long teacherId);

    @org.springframework.data.jpa.repository.Query(
            "SELECT COUNT(DISTINCT e.user.id) FROM Enrollment e WHERE e.subject.teacher.id = :teacherId")
    long countDistinctStudentsByTeacherId(Long teacherId);
    long countBySubjectId(Long subjectId);

    /** Enrollment count for many subjects in one grouped query, instead of one count per subject. */
    @org.springframework.data.jpa.repository.Query("SELECT e.subject.id AS subjectId, COUNT(e) AS enrollmentCount "
            + "FROM Enrollment e WHERE e.subject.id IN :subjectIds GROUP BY e.subject.id")
    List<SubjectEnrollmentCount> countBySubjectIdIn(
            @org.springframework.data.repository.query.Param("subjectIds") List<Long> subjectIds);

    interface SubjectEnrollmentCount {
        Long getSubjectId();
        long getEnrollmentCount();
    }

    void deleteByUserId(Long userId);
}
