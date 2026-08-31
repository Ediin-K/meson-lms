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

    private User studentA;
    private ScheduleSession sessionA;

    @BeforeEach
    void setUp() {
        attendanceRecordRepository.deleteAll();
        scheduleSessionRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
        departmentRepository.deleteAll();
        userRepository.deleteAll();

        User teacherA = newUser("TeacherA", TEACHER_A_EMAIL, "TEACHER");
        User teacherB = newUser("TeacherB", TEACHER_B_EMAIL, "TEACHER");
        studentA = newUser("StudentA", STUDENT_A_EMAIL, "STUDENT");
        newUser("StudentB", STUDENT_B_EMAIL, "STUDENT");
        newUser("Admin", ADMIN_EMAIL, "ADMIN");

        Department dept = newDepartment("Attendance Dept " + System.nanoTime());

        Subject subject = newSubject(teacherA, dept, "Attendance Subject " + System.nanoTime());
        sessionA = newSession(subject, teacherA);

        enroll(studentA, subject);
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
}
