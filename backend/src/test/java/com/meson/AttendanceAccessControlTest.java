package com.meson;

import com.meson.entity.*;
import com.meson.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Attendance is scoped to the ScheduleSession's own teacher (not Subject.teacher, which can
 * differ) for TEACHER, and to the record owner for STUDENT. Admin bypasses both.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AttendanceAccessControlTest {

    private static final String TEACHER_A_EMAIL = "attendance.teachera@test.com";
    private static final String TEACHER_B_EMAIL = "attendance.teacherb@test.com";
    private static final String STUDENT_A_EMAIL = "attendance.studenta@test.com";
    private static final String STUDENT_B_EMAIL = "attendance.studentb@test.com";
    private static final String ADMIN_EMAIL = "attendance.admin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired ScheduleSessionRepository scheduleSessionRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired AttendanceRecordRepository attendanceRecordRepository;

    private User teacherA;
    private User studentA;
    private Department dept;
    private Subject subjectA;
    private ScheduleSession sessionA;

    @BeforeEach
    void setUp() {
        attendanceRecordRepository.deleteAll();
        scheduleSessionRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
        departmentRepository.deleteAll();
        userRepository.deleteAll();

        teacherA = newUser("TeacherA", TEACHER_A_EMAIL, "TEACHER");
        User teacherB = newUser("TeacherB", TEACHER_B_EMAIL, "TEACHER");
        studentA = newUser("StudentA", STUDENT_A_EMAIL, "STUDENT");
        newUser("StudentB", STUDENT_B_EMAIL, "STUDENT");
        newUser("Admin", ADMIN_EMAIL, "ADMIN");

        dept = newDepartment("Attendance Dept " + System.nanoTime());

        subjectA = newSubject(teacherA, dept, "Attendance Subject " + System.nanoTime());
        sessionA = newSession(subjectA, teacherA);

        enroll(studentA, subjectA);
    }

    @AfterEach
    void tearDown() {
        attendanceRecordRepository.deleteAll();
        scheduleSessionRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
        departmentRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User newUser(String name, String email, String role) {
        User u = new User();
        u.setEmri(name);
        u.setMbiemri("Test");
        u.setEmail(email);
        u.setPasswordHash("x");
        u.setRole(role);
        return userRepository.save(u);
    }

    private Department newDepartment(String name) {
        Department d = new Department();
        d.setEmertimi(name);
        d.setPershkrimi("desc");
        d.setNumSemesters(6);
        return departmentRepository.save(d);
    }

    private Subject newSubject(User teacher, Department department, String title) {
        Subject s = new Subject();
        s.setTitulli(title);
        s.setPershkrimi("desc");
        s.setTeacher(teacher);
        s.setDepartment(department);
        s.setSemester(1);
        s.setEcts(5);
        s.setCreatedAt(LocalDateTime.now());
        return subjectRepository.save(s);
    }

    private ScheduleSession newSession(Subject subject, User teacher) {
        ScheduleSession s = ScheduleSession.builder()
                .subject(subject)
                .teacher(teacher)
                .sessionType(ScheduleSessionType.LECTURE)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 30))
                .capacity(30)
                .status("ACTIVE")
                .build();
        return scheduleSessionRepository.save(s);
    }

    private void enroll(User student, Subject subject) {
        Enrollment e = new Enrollment();
        e.setUser(student);
        e.setSubject(subject);
        e.setStatusi(EnrollmentStatus.AKTIV);
        e.setDataRegjistrimit(LocalDateTime.now());
        enrollmentRepository.save(e);
    }

    private void attend(ScheduleSession session, User student, LocalDate date, AttendanceStatus status) {
        attendanceRecordRepository.save(AttendanceRecord.builder()
                .scheduleSession(session)
                .sessionDate(date)
                .student(student)
                .status(status)
                .markedBy(teacherA)
                .markedAt(LocalDateTime.now())
                .build());
    }

    // ---- roster: TEACHER scoped to sessions they own ----

    @Test
    @WithMockUser(username = TEACHER_A_EMAIL, roles = "TEACHER")
    void ownerTeacherCanGetRoster() throws Exception {
        mockMvc.perform(get("/api/attendance/sessions/" + sessionA.getId() + "/roster").param("date", "2026-09-01"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = TEACHER_B_EMAIL, roles = "TEACHER")
    void otherTeacherCannotGetRoster() throws Exception {
        mockMvc.perform(get("/api/attendance/sessions/" + sessionA.getId() + "/roster").param("date", "2026-09-01"))
                .andExpect(status().isForbidden());
    }

    // ---- mark: TEACHER scoped to sessions they own ----

    @Test
    @WithMockUser(username = TEACHER_A_EMAIL, roles = "TEACHER")
    void ownerTeacherCanMarkAttendance() throws Exception {
        String body = "[{\"studentId\":" + studentA.getId() + ",\"status\":\"PRESENT\"}]";
        mockMvc.perform(post("/api/attendance/sessions/" + sessionA.getId() + "/mark")
                        .param("date", "2026-09-01")
                        .contentType("application/json").content(body))
                .andExpect(status().isNoContent());

        assertThat(attendanceRecordRepository.findByScheduleSessionIdAndSessionDate(
                sessionA.getId(), java.time.LocalDate.of(2026, 9, 1))).hasSize(1);
    }

    @Test
    @WithMockUser(username = TEACHER_B_EMAIL, roles = "TEACHER")
    void otherTeacherCannotMarkAttendance() throws Exception {
        String body = "[{\"studentId\":" + studentA.getId() + ",\"status\":\"PRESENT\"}]";
        mockMvc.perform(post("/api/attendance/sessions/" + sessionA.getId() + "/mark")
                        .param("date", "2026-09-01")
                        .contentType("application/json").content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminCanMarkAttendanceForAnySession() throws Exception {
        String body = "[{\"studentId\":" + studentA.getId() + ",\"status\":\"ABSENT\"}]";
        mockMvc.perform(post("/api/attendance/sessions/" + sessionA.getId() + "/mark")
                        .param("date", "2026-09-01")
                        .contentType("application/json").content(body))
                .andExpect(status().isNoContent());
    }

    // ---- student self-view ----

    @Test
    @WithMockUser(username = STUDENT_A_EMAIL, roles = "STUDENT")
    void studentCanViewOwnAttendance() throws Exception {
        mockMvc.perform(get("/api/attendance/student/" + studentA.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = STUDENT_B_EMAIL, roles = "STUDENT")
    void studentCannotViewAnotherStudentsAttendance() throws Exception {
        mockMvc.perform(get("/api/attendance/student/" + studentA.getId()))
                .andExpect(status().isForbidden());
    }

    // ---- admin-wide (cross-department) attendance summary ----

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminAttendanceSummaryShowsStudentsAcrossDepartments() throws Exception {
        Department deptB = newDepartment("Attendance Dept B " + System.nanoTime());
        Subject subjectB = newSubject(teacherA, deptB, "Attendance Subject B " + System.nanoTime());
        ScheduleSession sessionB = newSession(subjectB, teacherA);
        User studentB = userRepository.findByEmail(STUDENT_B_EMAIL).orElseThrow();
        enroll(studentB, subjectB);

        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.ABSENT);
        attend(sessionB, studentB, LocalDate.of(2026, 9, 1), AttendanceStatus.PRESENT);

        mockMvc.perform(get("/api/attendance/admin/summary"))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains(studentA.getEmri());
                    assertThat(json).contains(studentB.getEmri());
                    assertThat(json).contains(dept.getEmertimi());
                    assertThat(json).contains(deptB.getEmertimi());
                });
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminAttendanceSummaryIncludesEnrolledStudentWithNoRecords() throws Exception {
        mockMvc.perform(get("/api/attendance/admin/summary"))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains(studentA.getEmri());
                    assertThat(json).contains("\"totalSessions\":0");
                });
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminAttendanceDrilldownReturnsHistory() throws Exception {
        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.LATE);

        mockMvc.perform(get("/api/attendance/admin/student/" + studentA.getId())
                        .param("departmentId", String.valueOf(dept.getId())))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("\"totalSessions\":1"));
    }

    // ---- admin-wide summary: subject + date-range filters ----

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminAttendanceSummarySubjectFilterExcludesOtherSubject() throws Exception {
        Subject subjectC = newSubject(teacherA, dept, "Attendance Subject C " + System.nanoTime());
        ScheduleSession sessionC = newSession(subjectC, teacherA);
        User studentC = userRepository.findByEmail(STUDENT_B_EMAIL).orElseThrow();
        enroll(studentC, subjectC);

        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.PRESENT);
        attend(sessionC, studentC, LocalDate.of(2026, 9, 1), AttendanceStatus.PRESENT);

        mockMvc.perform(get("/api/attendance/admin/summary").param("subjectId", String.valueOf(subjectA.getId())))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains(studentA.getEmri());
                    assertThat(json).doesNotContain(studentC.getEmri());
                });
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminAttendanceSummaryDateRangeRecomputesPercentage() throws Exception {
        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.ABSENT);
        attend(sessionA, studentA, LocalDate.of(2026, 10, 1), AttendanceStatus.PRESENT);

        mockMvc.perform(get("/api/attendance/admin/summary")
                        .param("dateFrom", "2026-10-01").param("dateTo", "2026-10-31"))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains(studentA.getEmri());
                    assertThat(json).contains("\"totalSessions\":1");
                    assertThat(json).contains("\"presentPercentage\":100.0");
                });
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminAttendanceDrilldownRespectsSubjectFilter() throws Exception {
        Subject subjectC = newSubject(teacherA, dept, "Attendance Subject D " + System.nanoTime());
        ScheduleSession sessionC = newSession(subjectC, teacherA);
        enroll(studentA, subjectC);

        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.PRESENT);
        attend(sessionC, studentA, LocalDate.of(2026, 9, 2), AttendanceStatus.ABSENT);

        mockMvc.perform(get("/api/attendance/admin/student/" + studentA.getId())
                        .param("departmentId", String.valueOf(dept.getId()))
                        .param("subjectId", String.valueOf(subjectA.getId())))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("\"totalSessions\":1"));
    }

    @Test
    @WithMockUser(username = TEACHER_A_EMAIL, roles = "TEACHER")
    void teacherCannotAccessAdminAttendanceSummary() throws Exception {
        mockMvc.perform(get("/api/attendance/admin/summary"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = STUDENT_A_EMAIL, roles = "STUDENT")
    void studentCannotAccessAdminAttendanceSummary() throws Exception {
        mockMvc.perform(get("/api/attendance/admin/summary"))
                .andExpect(status().isForbidden());
    }
}
