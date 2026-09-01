package com.meson.service;

import com.meson.dto.AttendanceSummaryResponse;
import com.meson.dto.DepartmentAttendanceStudentRow;
import com.meson.dto.DepartmentHeadDashboardResponse;
import com.meson.dto.EnrollmentResponse;
import com.meson.dto.SubjectResponse;
import com.meson.entity.AttendanceRecord;
import com.meson.entity.Department;
import com.meson.entity.Enrollment;
import com.meson.entity.Subject;
import com.meson.entity.User;
import com.meson.repository.AttendanceRecordRepository;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.SubjectRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DepartmentHeadService {

    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectService subjectService;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceService attendanceService;

    public DepartmentHeadDashboardResponse getDashboard() {
        Department department = getOwnDepartment();
        List<Subject> subjects = subjectRepository.findByDepartmentId(department.getId());
        long teacherCount = subjects.stream()
                .map(s -> s.getTeacher().getId())
                .distinct()
                .count();

        return DepartmentHeadDashboardResponse.builder()
                .departmentId(department.getId())
                .departmentName(department.getEmertimi())
                .subjectCount(subjects.size())
                .teacherCount(teacherCount)
                .studentCount(enrollmentRepository.countDistinctStudentsByDepartmentId(department.getId()))
                .build();
    }

    public List<SubjectResponse> getSubjects() {
        Department department = getOwnDepartment();
        return subjectService.getByDepartmentId(department.getId());
    }

    public List<EnrollmentResponse> getStudents() {
        Department department = getOwnDepartment();
        return enrollmentRepository.findBySubjectDepartmentId(department.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * One row per student enrolled in a department subject, tallied by attendance status.
     * Students with no attendance records yet still appear (0 sessions) so coverage gaps show.
     * Sorted worst-first: students with sessions before those without, then ascending present %.
     */
    public List<DepartmentAttendanceStudentRow> getAttendanceSummary() {
        Department department = getOwnDepartment();
        Long departmentId = department.getId();

        Map<Long, String> studentNames = new LinkedHashMap<>();
        for (Enrollment enrollment : enrollmentRepository.findBySubjectDepartmentId(departmentId)) {
            User student = enrollment.getUser();
            studentNames.putIfAbsent(student.getId(), fullName(student));
        }

        Map<Long, int[]> tally = new HashMap<>(); // [present, absent, late, excused]
        for (AttendanceRecord record : attendanceRecordRepository.findByScheduleSessionSubjectDepartmentId(departmentId)) {
            User student = record.getStudent();
            studentNames.putIfAbsent(student.getId(), fullName(student));
            int[] counts = tally.computeIfAbsent(student.getId(), k -> new int[4]);
            switch (record.getStatus()) {
                case PRESENT -> counts[0]++;
                case ABSENT -> counts[1]++;
                case LATE -> counts[2]++;
                case EXCUSED -> counts[3]++;
            }
        }

        List<DepartmentAttendanceStudentRow> rows = new ArrayList<>();
        for (Map.Entry<Long, String> entry : studentNames.entrySet()) {
            int[] c = tally.getOrDefault(entry.getKey(), new int[4]);
            int total = c[0] + c[1] + c[2] + c[3];
            double presentPercentage = total > 0 ? (c[0] * 100.0) / total : 0.0;
            rows.add(DepartmentAttendanceStudentRow.builder()
                    .studentId(entry.getKey())
                    .studentName(entry.getValue())
                    .totalSessions(total)
                    .presentCount(c[0])
                    .absentCount(c[1])
                    .lateCount(c[2])
                    .excusedCount(c[3])
                    .presentPercentage(presentPercentage)
                    .build());
        }

        rows.sort(Comparator
                .comparing((DepartmentAttendanceStudentRow r) -> r.getTotalSessions() == 0)
                .thenComparing(DepartmentAttendanceStudentRow::getPresentPercentage)
                .thenComparing(DepartmentAttendanceStudentRow::getStudentName));
        return rows;
    }

    /** Full dated history + stats for one student, scoped to this head's own department. */
    public AttendanceSummaryResponse getStudentAttendance(Long studentId) {
        Department department = getOwnDepartment();
        if (!enrollmentRepository.existsByUserIdAndSubjectDepartmentId(studentId, department.getId())) {
            throw new AccessDeniedException("Studenti nuk i përket departamentit tuaj");
        }
        return attendanceService.getForStudentInDepartment(studentId, department.getId());
    }

    private Department getOwnDepartment() {
        User user = getCurrentUser();
        return departmentRepository.findByHeadId(user.getId())
                .orElseThrow(() -> new AccessDeniedException("Nuk jeni caktuar si kryetar departamenti"));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet."));
    }

    private String fullName(User user) {
        return user.getEmri() + " " + user.getMbiemri();
    }

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .userEmri(enrollment.getUser().getEmri() + " " + enrollment.getUser().getMbiemri())
                .subjectId(enrollment.getSubject().getId())
                .subjectTitulli(enrollment.getSubject().getTitulli())
                .progresi(enrollment.getProgresi())
                .statusi(enrollment.getStatusi())
                .dataRegjistrimit(enrollment.getDataRegjistrimit())
                .build();
    }
}
