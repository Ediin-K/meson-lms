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

import java.time.LocalDateTime;

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

    private User headA;
    private User teacher;
    private Department deptA;
    private Department deptB;
    private Subject subjectA;
    private Subject subjectB;

    @BeforeEach
    void setUp() {
        gradeAuditLogRepository.deleteAll();
        submissionRepository.deleteAll();
        assignmentRepository.deleteAll();
        enrollmentRepository.deleteAll();
        lessonRepository.deleteAll();
        moduleRepository.deleteAll();
        subjectRepository.deleteAll();
        departmentRepository.deleteAll();
        userRepository.deleteAll();

        headA = newUser("HeadA", HEAD_A_EMAIL, "DEPARTMENT_HEAD");
        teacher = newUser("Teacher", "depthead.teacher@test.com", "TEACHER");
        newUser("Admin", ADMIN_EMAIL, "ADMIN");

        deptA = newDepartment("Dept A " + System.nanoTime(), headA);
        deptB = newDepartment("Dept B " + System.nanoTime(), null);

        subjectA = newSubject(teacher, deptA, "Subject A " + System.nanoTime());
        subjectB = newSubject(teacher, deptB, "Subject B " + System.nanoTime());
    }

    @AfterEach
    void tearDown() {
        gradeAuditLogRepository.deleteAll();
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
}
