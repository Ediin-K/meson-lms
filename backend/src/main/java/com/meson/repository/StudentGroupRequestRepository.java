package com.meson.repository;

import com.meson.entity.GroupRequestStatus;
import com.meson.entity.StudentGroupRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentGroupRequestRepository extends JpaRepository<StudentGroupRequest, Long> {
    Optional<StudentGroupRequest> findByStudentIdAndStatus(Long studentId, GroupRequestStatus status);

    void deleteByStudentId(Long studentId);

    void deleteByApprovedById(Long approvedById);
}
