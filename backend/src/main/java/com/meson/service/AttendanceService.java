package com.meson.service;

import com.meson.dto.AdminAttendanceStudentRow;
import com.meson.dto.AttendanceMarkRequest;
import com.meson.dto.AttendanceRecordResponse;
import com.meson.dto.AttendanceRosterEntryResponse;
import com.meson.dto.AttendanceSummaryResponse;
import com.meson.entity.AttendanceRecord;
import com.meson.entity.Enrollment;
import com.meson.entity.ScheduleSession;
import com.meson.entity.Subject;
import com.meson.entity.User;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.AttendanceRecordRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.ScheduleSessionRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AttendanceRosterEntryResponse> getRoster(Long scheduleSessionId, LocalDate date) {
        ScheduleSession session = scheduleSessionRepository.findById(scheduleSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesioni nuk u gjet"));
        assertCanManageSession(session);

        List<User> students = resolveRosterStudents(session);
        Map<Long, AttendanceRecord> existing = new LinkedHashMap<>();
        attendanceRecordRepository.findByScheduleSessionIdAndSessionDate(scheduleSessionId, date)
                .forEach(r -> existing.put(r.getStudent().getId(), r));

        return students.stream()
                .map(student -> {
                    AttendanceRecord record = existing.get(student.getId());
                    return AttendanceRosterEntryResponse.builder()
                            .studentId(student.getId())
                            .studentName(student.getEmri() + " " + student.getMbiemri())
                            .status(record != null ? record.getStatus() : null)
                            .comment(record != null ? record.getComment() : null)
                            .build();
                })
                .toList();
    }

    @Transactional
    public void markAttendance(Long scheduleSessionId, LocalDate date, List<AttendanceMarkRequest> marks) {
        if (marks == null || marks.isEmpty()) {
            throw new BadRequestException("Duhet te caktoni te pakten nje student");
        }
        ScheduleSession session = scheduleSessionRepository.findById(scheduleSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesioni nuk u gjet"));
        assertCanManageSession(session);

        User markedBy = getCurrentUser();
        for (AttendanceMarkRequest mark : marks) {
            User student = userRepository.findById(mark.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Studenti nuk u gjet"));

            AttendanceRecord record = attendanceRecordRepository
                    .findByScheduleSessionIdAndSessionDateAndStudentId(scheduleSessionId, date, student.getId())
                    .orElseGet(() -> AttendanceRecord.builder()
                            .scheduleSession(session)
                            .sessionDate(date)
                            .student(student)
                            .build());

            record.setStatus(mark.getStatus());
            record.setComment(mark.getComment());
            record.setMarkedBy(markedBy);
            record.setMarkedAt(LocalDateTime.now());
            attendanceRecordRepository.save(record);
        }
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getForStudent(Long studentId) {
        return summarize(attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(studentId));
    }

    /**
     * Same shape as getForStudent, but only the student's records within one department's
     * subjects, optionally narrowed to one subject and/or a date range (any null is ignored).
     */
    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getForStudentInDepartment(Long studentId, Long departmentId,
            Long subjectId, LocalDate from, LocalDate to) {
        return summarize(attendanceRecordRepository
                .findForStudentDrilldown(studentId, departmentId, subjectId, from, to));
    }

    /**
     * DH + Admin attendance summary: one row per (student, department) pair, tallied by status,
     * optionally narrowed to one department, one subject, and/or a date range (any null is
     * ignored — DH always passes its own department; Admin may pass none for "all departments").
     * Enrolled students with no matching records still appear (0 sessions) so coverage gaps show.
     * Subjects with no department are excluded. Sorted worst-first: students with sessions before
     * those without, then ascending present %.
     */
    @Transactional(readOnly = true)
    public List<AdminAttendanceStudentRow> getAdminAttendanceSummary(Long departmentId, Long subjectId,
            LocalDate from, LocalDate to) {
        Map<RowKey, AdminAttendanceStudentRow> rows = new LinkedHashMap<>();

        for (Enrollment enrollment : enrollmentRepository.findForAttendanceSummary(departmentId, subjectId)) {
            rowFor(rows, enrollment.getUser(), enrollment.getSubject());
        }

        for (AttendanceRecord record : attendanceRecordRepository.findForSummary(departmentId, subjectId, from, to)) {
            AdminAttendanceStudentRow row = rowFor(rows, record.getStudent(),
                    record.getScheduleSession().getSubject());
            switch (record.getStatus()) {
                case PRESENT -> row.setPresentCount(row.getPresentCount() + 1);
                case ABSENT -> row.setAbsentCount(row.getAbsentCount() + 1);
                case LATE -> row.setLateCount(row.getLateCount() + 1);
                case EXCUSED -> row.setExcusedCount(row.getExcusedCount() + 1);
            }
        }

        List<AdminAttendanceStudentRow> result = new ArrayList<>(rows.values());
        for (AdminAttendanceStudentRow row : result) {
            int total = row.getPresentCount() + row.getAbsentCount() + row.getLateCount() + row.getExcusedCount();
            row.setTotalSessions(total);
            row.setPresentPercentage(total > 0 ? (row.getPresentCount() * 100.0) / total : 0.0);
        }
        result.sort(Comparator
                .comparing((AdminAttendanceStudentRow r) -> r.getTotalSessions() == 0)
                .thenComparing(AdminAttendanceStudentRow::getPresentPercentage)
                .thenComparing(AdminAttendanceStudentRow::getDepartmentName)
                .thenComparing(AdminAttendanceStudentRow::getStudentName));
        return result;
    }

    /** Admin drill-down: one student's dated history, scoped to one department. Admin sees all — no ownership check. */
    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getAdminStudentAttendance(Long studentId, Long departmentId,
            Long subjectId, LocalDate from, LocalDate to) {
        return getForStudentInDepartment(studentId, departmentId, subjectId, from, to);
    }

    private record RowKey(Long studentId, Long departmentId) {}

    private AdminAttendanceStudentRow rowFor(Map<RowKey, AdminAttendanceStudentRow> rows, User student, Subject subject) {
        RowKey key = new RowKey(student.getId(), subject.getDepartment().getId());
        return rows.computeIfAbsent(key, k -> AdminAttendanceStudentRow.builder()
                .studentId(student.getId())
                .studentName(student.getEmri() + " " + student.getMbiemri())
                .departmentId(subject.getDepartment().getId())
                .departmentName(subject.getDepartment().getEmertimi())
                .build());
    }

    private AttendanceSummaryResponse summarize(List<AttendanceRecord> records) {
        int present = 0;
        int absent = 0;
        int late = 0;
        int excused = 0;
        for (AttendanceRecord r : records) {
            switch (r.getStatus()) {
                case PRESENT -> present++;
                case ABSENT -> absent++;
                case LATE -> late++;
                case EXCUSED -> excused++;
            }
        }
        int total = records.size();
        double presentPercentage = total > 0 ? (present * 100.0) / total : 0.0;

        List<AttendanceRecordResponse> responses = records.stream()
                .map(r -> AttendanceRecordResponse.builder()
                        .id(r.getId())
                        .sessionDate(r.getSessionDate())
                        .subjectTitulli(r.getScheduleSession().getSubject().getTitulli())
                        .status(r.getStatus())
                        .comment(r.getComment())
                        .build())
                .toList();

        return AttendanceSummaryResponse.builder()
                .records(responses)
                .totalSessions(total)
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .excusedCount(excused)
                .presentPercentage(presentPercentage)
                .build();
    }

    private List<User> resolveRosterStudents(ScheduleSession session) {
        List<Enrollment> enrollments;
        if (session.getSubjectSubgroup() != null) {
            enrollments = enrollmentRepository.findBySubjectSubgroupId(session.getSubjectSubgroup().getId());
        } else if (session.getSubjectGroup() != null) {
            enrollments = enrollmentRepository.findBySubjectGroupId(session.getSubjectGroup().getId());
        } else {
            enrollments = enrollmentRepository.findBySubjectId(session.getSubject().getId());
        }
        return enrollments.stream().map(Enrollment::getUser).toList();
    }

    /** ADMIN bypasses; TEACHER only allowed on sessions they own (ScheduleSession.teacher, not Subject.teacher). */
    private void assertCanManageSession(ScheduleSession session) {
        if (hasRole("ADMIN")) {
            return;
        }
        User current = getCurrentUser();
        if (session.getTeacher() == null || !session.getTeacher().getId().equals(current.getId())) {
            throw new AccessDeniedException("Nuk keni qasje ne kete sesion");
        }
    }

    private boolean hasRole(String role) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String target = "ROLE_" + role;
        return auth.getAuthorities().stream().anyMatch(a -> target.equals(a.getAuthority()));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet."));
    }
}
