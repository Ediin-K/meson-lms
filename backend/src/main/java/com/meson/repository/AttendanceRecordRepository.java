package com.meson.repository;

import com.meson.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    @EntityGraph(attributePaths = {"student", "scheduleSession"})
    List<AttendanceRecord> findByScheduleSessionIdAndSessionDate(Long scheduleSessionId, LocalDate sessionDate);

    Optional<AttendanceRecord> findByScheduleSessionIdAndSessionDateAndStudentId(
            Long scheduleSessionId, LocalDate sessionDate, Long studentId);

    @EntityGraph(attributePaths = {"scheduleSession", "scheduleSession.subject"})
    List<AttendanceRecord> findByStudentIdOrderBySessionDateDesc(Long studentId);

    void deleteByStudentId(Long studentId);

    void deleteByMarkedById(Long markedById);

    /** Must run before deleting a teacher's ScheduleSessions (attendance_records FKs to schedule_sessions). */
    void deleteByScheduleSessionTeacherId(Long teacherId);
}
