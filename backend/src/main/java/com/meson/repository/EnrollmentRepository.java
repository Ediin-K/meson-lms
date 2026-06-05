package com.meson.repository;

import com.meson.entity.Enrollment;
import com.meson.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(Long userId);
    List<Enrollment> findBySubjectId(Long subjectId);
    List<Enrollment> findByUserIdAndStatusi(Long userId, EnrollmentStatus statusi);
    Optional<Enrollment> findByUserIdAndSubjectId(Long userId, Long subjectId);
    boolean existsByUserIdAndSubjectId(Long userId, Long subjectId);

    List<Enrollment> findBySubjectTeacherId(Long teacherId);
    long countBySubjectTeacherId(Long teacherId);
    long countBySubjectId(Long subjectId);

    void deleteByUserId(Long userId);
}
