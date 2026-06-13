package com.meson.repository;

import com.meson.entity.ScheduleSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ScheduleSessionRepository extends JpaRepository<ScheduleSession, Long> {
    List<ScheduleSession> findBySubjectDepartmentIdAndSubjectSemester(Long departmentId, Integer semester);
    List<ScheduleSession> findBySubjectDepartmentIdAndSubjectSemesterAndSubjectGroupDepartmentGroupId(
            Long departmentId, Integer semester, Long departmentGroupId);
    List<ScheduleSession> findBySubjectGroupDepartmentGroupId(Long departmentGroupId);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.subject c
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.subjectGroup cg
            LEFT JOIN FETCH s.subjectSubgroup
            WHERE cg.departmentGroup.id = :departmentGroupId
              AND c.semester = :semester
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findByDepartmentGroupIdAndSemester(
            @Param("departmentGroupId") Long departmentGroupId,
            @Param("semester") Integer semester);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.subject c
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.subjectGroup cg
            LEFT JOIN FETCH s.subjectSubgroup
            WHERE c.department.id = :departmentId
              AND c.semester = :semester
              AND cg.departmentGroup.id = :departmentGroupId
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findApprovedSchedulesForStudent(
            @Param("departmentId") Long departmentId,
            @Param("semester") Integer semester,
            @Param("departmentGroupId") Long departmentGroupId);

    List<ScheduleSession> findByTeacherId(Long teacherId);
    List<ScheduleSession> findByDayOfWeek(DayOfWeek dayOfWeek);

    void deleteByTeacherId(Long teacherId);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.subject c
            LEFT JOIN FETCH c.department
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.subjectGroup
            LEFT JOIN FETCH s.subjectSubgroup
            """)
    List<ScheduleSession> findAllWithDetails();

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.subject c
            LEFT JOIN FETCH c.department
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.subjectGroup
            LEFT JOIN FETCH s.subjectSubgroup
            WHERE s.teacher.id = :teacherId
            """)
    List<ScheduleSession> findByTeacherIdWithDetails(@Param("teacherId") Long teacherId);

    @Query("""
            SELECT s FROM ScheduleSession s
            WHERE s.teacher.id = :teacherId
              AND s.dayOfWeek = :day
              AND s.startTime < :endTime
              AND s.endTime > :startTime
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findOverlappingForTeacher(
            @Param("teacherId") Long teacherId,
            @Param("day") DayOfWeek day,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("""
            SELECT s FROM ScheduleSession s
            WHERE s.subjectGroup.id = :subjectGroupId
              AND s.dayOfWeek = :day
              AND s.startTime < :endTime
              AND s.endTime > :startTime
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findOverlappingForSubjectGroup(
            @Param("subjectGroupId") Long subjectGroupId,
            @Param("day") DayOfWeek day,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
