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
    List<ScheduleSession> findBySubjectDirectionIdAndSubjectSemester(Long directionId, Integer semester);
    List<ScheduleSession> findBySubjectDirectionIdAndSubjectSemesterAndSubjectGroupDirectionGroupId(
            Long directionId, Integer semester, Long directionGroupId);
    List<ScheduleSession> findBySubjectGroupDirectionGroupId(Long directionGroupId);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.subject c
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.subjectGroup cg
            LEFT JOIN FETCH s.subjectSubgroup
            WHERE cg.directionGroup.id = :directionGroupId
              AND c.semester = :semester
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findByDirectionGroupIdAndSemester(
            @Param("directionGroupId") Long directionGroupId,
            @Param("semester") Integer semester);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.subject c
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.subjectGroup cg
            LEFT JOIN FETCH s.subjectSubgroup
            WHERE c.direction.id = :categoryId
              AND c.semester = :semester
              AND cg.directionGroup.id = :directionGroupId
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findApprovedSchedulesForStudent(
            @Param("categoryId") Long categoryId,
            @Param("semester") Integer semester,
            @Param("directionGroupId") Long directionGroupId);

    List<ScheduleSession> findByTeacherId(Long teacherId);
    List<ScheduleSession> findByDayOfWeek(DayOfWeek dayOfWeek);

    void deleteByTeacherId(Long teacherId);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.subject c
            LEFT JOIN FETCH c.direction
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.subjectGroup
            LEFT JOIN FETCH s.subjectSubgroup
            """)
    List<ScheduleSession> findAllWithDetails();

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.subject c
            LEFT JOIN FETCH c.direction
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
