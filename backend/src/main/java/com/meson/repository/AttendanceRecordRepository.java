package com.meson.repository;

import com.meson.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * DH + Admin attendance summary: every record, optionally narrowed to one department,
     * one subject, and/or a date range. Any null filter is ignored.
     */
    @Query("select a from AttendanceRecord a "
            + "join fetch a.student "
            + "join a.scheduleSession ss join ss.subject s "
            + "where (:departmentId is null or s.department.id = :departmentId) "
            + "and (:subjectId is null or s.id = :subjectId) "
            + "and (:from is null or a.sessionDate >= :from) "
            + "and (:to is null or a.sessionDate <= :to)")
    List<AttendanceRecord> findForSummary(@Param("departmentId") Long departmentId,
            @Param("subjectId") Long subjectId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    /**
     * DH + Admin drill-down: one student's dated history within one department, optionally
     * narrowed to one subject and/or a date range.
     */
    @Query("select a from AttendanceRecord a join fetch a.scheduleSession ss join fetch ss.subject s "
            + "where a.student.id = :studentId and s.department.id = :departmentId "
            + "and (:subjectId is null or s.id = :subjectId) "
            + "and (:from is null or a.sessionDate >= :from) "
            + "and (:to is null or a.sessionDate <= :to) "
            + "order by a.sessionDate desc")
    List<AttendanceRecord> findForStudentDrilldown(@Param("studentId") Long studentId,
            @Param("departmentId") Long departmentId, @Param("subjectId") Long subjectId,
            @Param("from") LocalDate from, @Param("to") LocalDate to);

    void deleteByStudentId(Long studentId);

    void deleteByMarkedById(Long markedById);

    /** Must run before deleting a teacher's ScheduleSessions (attendance_records FKs to schedule_sessions). */
    void deleteByScheduleSessionTeacherId(Long teacherId);
}
