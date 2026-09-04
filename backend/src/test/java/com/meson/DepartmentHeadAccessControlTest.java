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
 * Department Head is a scoped Admin: same category of subject-management/audit-log actions,
 * restricted to their own department. Admin keeps full access to every department, unchanged.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DepartmentHeadAccessControlTest {

    private static final String HEAD_A_EMAIL = "depthead.a@test.com";
    private static final String ADMIN_EMAIL = "depthead.admin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired ModuleRepository moduleRepository;
    @Autowired LessonRepository lessonRepository;
    @Autowired AssignmentRepository assignmentRepository;
    @Autowired AssignmentSubmissionRepository submissionRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired GradeAuditLogRepository gradeAuditLogRepository;
    @Autowired ScheduleSessionRepository scheduleSessionRepository;
    @Autowired AttendanceRecordRepository attendanceRecordRepository;

    private User headA;
    private User teacher;
    private User studentA;
    private User studentB;
    private Department deptA;
    private Department deptB;
    private Subject subjectA;
    private Subject subjectB;
    private ScheduleSession sessionA;
    private ScheduleSession sessionB;

    @BeforeEach
    void setUp() {
        cleanUp();

        headA = newUser("HeadA", HEAD_A_EMAIL, "DEPARTMENT_HEAD");
        teacher = newUser("Teacher", "depthead.teacher@test.com", "TEACHER");
        studentA = newUser("StudentA", "depthead.studenta@test.com", "STUDENT");
        studentB = newUser("StudentB", "depthead.studentb@test.com", "STUDENT");
        newUser("Admin", ADMIN_EMAIL, "ADMIN");

        deptA = newDepartment("Dept A " + System.nanoTime(), headA);
        deptB = newDepartment("Dept B " + System.nanoTime(), null);

        subjectA = newSubject(teacher, deptA, "Subject A " + System.nanoTime());
        subjectB = newSubject(teacher, deptB, "Subject B " + System.nanoTime());

        sessionA = newSession(subjectA);
        sessionB = newSession(subjectB);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        gradeAuditLogRepository.deleteAll();
        attendanceRecordRepository.deleteAll();
        scheduleSessionRepository.deleteAll();
        submissionRepository.deleteAll();
        assignmentRepository.deleteAll();
        enrollmentRepository.deleteAll();
        lessonRepository.deleteAll();
        moduleRepository.deleteAll();
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

    private Department newDepartment(String name, User head) {
        Department d = new Department();
        d.setEmertimi(name);
        d.setPershkrimi("desc");
        d.setNumSemesters(6);
        d.setHead(head);
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

    private ScheduleSession newSession(Subject subject) {
        return scheduleSessionRepository.save(ScheduleSession.builder()
                .subject(subject)
                .teacher(teacher)
                .sessionType(ScheduleSessionType.LECTURE)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 30))
                .capacity(30)
                .status("ACTIVE")
                .build());
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
                .markedBy(teacher)
                .markedAt(LocalDateTime.now())
                .build());
    }

    // ---- subject create: DEPARTMENT_HEAD scoped to own department ----

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void departmentHeadCanCreateSubjectInOwnDepartment() throws Exception {
        String body = "{\"titulli\":\"New Subject " + System.nanoTime() + "\",\"pershkrimi\":\"d\","
                + "\"teacherId\":" + teacher.getId() + ",\"departmentId\":" + deptA.getId() + ",\"semester\":1}";
        mockMvc.perform(post("/api/subjects").contentType("application/json").content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void departmentHeadCannotCreateSubjectInOtherDepartment() throws Exception {
        String body = "{\"titulli\":\"New Subject " + System.nanoTime() + "\",\"pershkrimi\":\"d\","
                + "\"teacherId\":" + teacher.getId() + ",\"departmentId\":" + deptB.getId() + ",\"semester\":1}";
        mockMvc.perform(post("/api/subjects").contentType("application/json").content(body))
                .andExpect(status().isForbidden());
    }

    // ---- subject update/delete: DEPARTMENT_HEAD scoped to own department ----

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void departmentHeadCanUpdateOwnDepartmentSubject() throws Exception {
        String body = "{\"titulli\":\"" + subjectA.getTitulli() + " Updated\",\"pershkrimi\":\"d\","
                + "\"teacherId\":" + teacher.getId() + ",\"departmentId\":" + deptA.getId() + ",\"semester\":1}";
        mockMvc.perform(put("/api/subjects/" + subjectA.getId()).contentType("application/json").content(body))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void departmentHeadCannotUpdateOtherDepartmentSubject() throws Exception {
        String body = "{\"titulli\":\"" + subjectB.getTitulli() + " Updated\",\"pershkrimi\":\"d\","
                + "\"teacherId\":" + teacher.getId() + ",\"departmentId\":" + deptB.getId() + ",\"semester\":1}";
        mockMvc.perform(put("/api/subjects/" + subjectB.getId()).contentType("application/json").content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void departmentHeadCannotDeleteOtherDepartmentSubject() throws Exception {
        mockMvc.perform(delete("/api/subjects/" + subjectB.getId()))
                .andExpect(status().isForbidden());
        assertThat(subjectRepository.findById(subjectB.getId())).isPresent();
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminCanManageSubjectInAnyDepartment() throws Exception {
        String body = "{\"titulli\":\"" + subjectB.getTitulli() + " Updated\",\"pershkrimi\":\"d\","
                + "\"teacherId\":" + teacher.getId() + ",\"departmentId\":" + deptB.getId() + ",\"semester\":1}";
        mockMvc.perform(put("/api/subjects/" + subjectB.getId()).contentType("application/json").content(body))
                .andExpect(status().isOk());
    }

    // ---- grade audit log: DEPARTMENT_HEAD sees only their department's subjects ----

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void departmentHeadAuditLogOnlyShowsOwnDepartment() throws Exception {
        gradeAuditLogRepository.save(GradeAuditLog.builder()
                .gradeId(1L).studentId(1L).studentName("Student One")
                .subjectId(subjectA.getId()).subjectTitulli(subjectA.getTitulli())
                .performedById(teacher.getId()).performedByName("Teacher Test")
                .action(GradeAuditAction.CREATED).newGrade(9).performedAt(LocalDateTime.now())
                .build());
        gradeAuditLogRepository.save(GradeAuditLog.builder()
                .gradeId(2L).studentId(2L).studentName("Student Two")
                .subjectId(subjectB.getId()).subjectTitulli(subjectB.getTitulli())
                .performedById(teacher.getId()).performedByName("Teacher Test")
                .action(GradeAuditAction.CREATED).newGrade(7).performedAt(LocalDateTime.now())
                .build());

        mockMvc.perform(get("/api/grades/audit-log"))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains(subjectA.getTitulli());
                    assertThat(json).doesNotContain(subjectB.getTitulli());
                });
    }

    @Test
    @WithMockUser(username = "depthead.noassignment@test.com", roles = "DEPARTMENT_HEAD")
    void departmentHeadWithNoAssignedDepartmentGetsForbiddenOnAuditLog() throws Exception {
        newUser("Unassigned", "depthead.noassignment@test.com", "DEPARTMENT_HEAD");
        mockMvc.perform(get("/api/grades/audit-log"))
                .andExpect(status().isForbidden());
    }

    // ---- attendance: DEPARTMENT_HEAD sees only their own department ----

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void attendanceSummaryOnlyShowsOwnDepartment() throws Exception {
        enroll(studentA, subjectA);
        enroll(studentB, subjectB);
        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.ABSENT);
        attend(sessionB, studentB, LocalDate.of(2026, 9, 1), AttendanceStatus.PRESENT);

        mockMvc.perform(get("/api/department-head/attendance"))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains(studentA.getEmri());
                    assertThat(json).doesNotContain(studentB.getEmri());
                });
    }

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void attendanceSummaryIncludesEnrolledStudentWithNoRecords() throws Exception {
        enroll(studentA, subjectA);

        mockMvc.perform(get("/api/department-head/attendance"))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains(studentA.getEmri());
                    assertThat(json).contains("\"totalSessions\":0");
                });
    }

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void attendanceDrilldownScopedToOwnDepartment() throws Exception {
        enroll(studentA, subjectA);
        enroll(studentB, subjectB);

        mockMvc.perform(get("/api/department-head/attendance/" + studentA.getId()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/department-head/attendance/" + studentB.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "depthead.noassignment@test.com", roles = "DEPARTMENT_HEAD")
    void departmentHeadWithNoAssignedDepartmentGetsForbiddenOnAttendance() throws Exception {
        newUser("Unassigned", "depthead.noassignment@test.com", "DEPARTMENT_HEAD");
        mockMvc.perform(get("/api/department-head/attendance"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/department-head/attendance/" + studentA.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "depthead.teacher@test.com", roles = "TEACHER")
    void nonDepartmentHeadCannotAccessAttendanceSummary() throws Exception {
        mockMvc.perform(get("/api/department-head/attendance"))
                .andExpect(status().isForbidden());
    }

    // ---- attendance summary: subject + date-range filters ----

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void attendanceSummarySubjectFilterExcludesOtherSubject() throws Exception {
        Subject subjectC = newSubject(teacher, deptA, "Subject C " + System.nanoTime());
        ScheduleSession sessionC = newSession(subjectC);
        enroll(studentA, subjectA);
        enroll(studentB, subjectC);
        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.PRESENT);
        attend(sessionC, studentB, LocalDate.of(2026, 9, 1), AttendanceStatus.PRESENT);

        mockMvc.perform(get("/api/department-head/attendance").param("subjectId", String.valueOf(subjectA.getId())))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains(studentA.getEmri());
                    assertThat(json).doesNotContain(studentB.getEmri());
                });
    }

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void attendanceSummaryDateRangeRecomputesPercentage() throws Exception {
        enroll(studentA, subjectA);
        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.ABSENT);
        attend(sessionA, studentA, LocalDate.of(2026, 10, 1), AttendanceStatus.PRESENT);

        mockMvc.perform(get("/api/department-head/attendance")
                        .param("dateFrom", "2026-10-01").param("dateTo", "2026-10-31"))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    assertThat(json).contains("\"totalSessions\":1");
                    assertThat(json).contains("\"presentPercentage\":100.0");
                });
    }

    @Test
    @WithMockUser(username = HEAD_A_EMAIL, roles = "DEPARTMENT_HEAD")
    void attendanceDrilldownRespectsSubjectFilter() throws Exception {
        Subject subjectC = newSubject(teacher, deptA, "Subject D " + System.nanoTime());
        ScheduleSession sessionC = newSession(subjectC);
        enroll(studentA, subjectA);
        enroll(studentA, subjectC);
        attend(sessionA, studentA, LocalDate.of(2026, 9, 1), AttendanceStatus.PRESENT);
        attend(sessionC, studentA, LocalDate.of(2026, 9, 2), AttendanceStatus.ABSENT);

        mockMvc.perform(get("/api/department-head/attendance/" + studentA.getId())
                        .param("subjectId", String.valueOf(subjectA.getId())))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains("\"totalSessions\":1"));
    }

    // ---- deleting a department head unassigns them; the department survives (head_user_id FK is RESTRICT) ----

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void deletingDepartmentHeadUserUnassignsThemFromDepartment() throws Exception {
        mockMvc.perform(delete("/api/users/" + headA.getId()))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findById(headA.getId())).isEmpty();
        Department reloaded = departmentRepository.findById(deptA.getId()).orElseThrow();
        assertThat(reloaded.getHead()).isNull();
    }
}
