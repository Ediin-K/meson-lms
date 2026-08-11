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

/** Grade audit trail: every create/update/delete is logged and survives the grade's own deletion. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GradeAuditLogTest {

    private static final String TEACHER_EMAIL = "audittrailteacher@test.com";
    private static final String OTHER_TEACHER_EMAIL = "audittrailotherteacher@test.com";
    private static final String ADMIN_EMAIL = "audittrailadmin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired GradeRepository gradeRepository;
    @Autowired GradeAuditLogRepository gradeAuditLogRepository;
    @Autowired EnrollmentRepository enrollmentRepository;

    private User student;
    private User teacher;
    private Subject subject;

    @BeforeEach
    void setUp() {
        gradeAuditLogRepository.deleteAll();
        gradeRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();

        teacher = newUser("Teacher", TEACHER_EMAIL, "TEACHER");
        newUser("OtherTeacher", OTHER_TEACHER_EMAIL, "TEACHER");
        newUser("Admin", ADMIN_EMAIL, "ADMIN");
        student = newUser("Student", "audittrailstudent@test.com", "STUDENT");

        subject = new Subject();
        subject.setTitulli("Audit Trail Subject " + System.nanoTime());
        subject.setPershkrimi("desc");
        subject.setTeacher(teacher);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(student);
        enrollment.setSubject(subject);
        enrollment.setStatusi(EnrollmentStatus.AKTIV);
        enrollment.setDataRegjistrimit(LocalDateTime.now());
        enrollmentRepository.save(enrollment);
    }

    @AfterEach
    void tearDown() {
        gradeAuditLogRepository.deleteAll();
        gradeRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
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

    @Test
    @WithMockUser(username = TEACHER_EMAIL, roles = "TEACHER")
    void createUpdateDeleteEachLogAnAuditEntry() throws Exception {
        String createBody = "{\"studentId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + ",\"grade\":8}";
        String response = mockMvc.perform(post("/api/grades").contentType("application/json").content(createBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long gradeId = Long.valueOf(response.replaceAll(".*\"id\":(\\d+).*", "$1"));

        String updateBody = "{\"studentId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + ",\"grade\":10}";
        mockMvc.perform(put("/api/grades/" + gradeId).contentType("application/json").content(updateBody))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/grades/" + gradeId))
                .andExpect(status().isNoContent());

        // The grade itself is gone, but its history survives.
        assertThat(gradeRepository.findById(gradeId)).isEmpty();

        String historyJson = mockMvc.perform(get("/api/grades/" + gradeId + "/history"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(historyJson).contains("\"action\":\"CREATED\"");
        assertThat(historyJson).contains("\"action\":\"UPDATED\"");
        assertThat(historyJson).contains("\"action\":\"DELETED\"");
        assertThat(historyJson).contains("\"previousGrade\":8,\"newGrade\":10");
    }

    @Test
    @WithMockUser(username = TEACHER_EMAIL, roles = "TEACHER")
    void teacherAuditLogOnlyShowsOwnSubjects() throws Exception {
        mockMvc.perform(post("/api/grades").contentType("application/json")
                        .content("{\"studentId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + ",\"grade\":9}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/grades/audit-log"))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains(subject.getTitulli()));
    }

    @Test
    @WithMockUser(username = OTHER_TEACHER_EMAIL, roles = "TEACHER")
    void otherTeacherCannotSeeAnotherTeachersSubjectInAuditLog() throws Exception {
        gradeRepository.save(Grade.builder().student(student).subject(subject).professor(teacher)
                .grade(9).assignedAt(LocalDateTime.now()).build());
        // Log the audit entry the same way the service would (direct repository write for setup speed).
        gradeAuditLogRepository.save(GradeAuditLog.builder()
                .gradeId(1L).studentId(student.getId()).studentName("Student Test")
                .subjectId(subject.getId()).subjectTitulli(subject.getTitulli())
                .performedById(teacher.getId()).performedByName("Teacher Test")
                .action(GradeAuditAction.CREATED).newGrade(9).performedAt(LocalDateTime.now())
                .build());

        mockMvc.perform(get("/api/grades/audit-log"))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .doesNotContain(subject.getTitulli()));
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminAuditLogSeesEverySubject() throws Exception {
        gradeAuditLogRepository.save(GradeAuditLog.builder()
                .gradeId(1L).studentId(student.getId()).studentName("Student Test")
                .subjectId(subject.getId()).subjectTitulli(subject.getTitulli())
                .performedById(teacher.getId()).performedByName("Teacher Test")
                .action(GradeAuditAction.CREATED).newGrade(9).performedAt(LocalDateTime.now())
                .build());

        mockMvc.perform(get("/api/grades/audit-log"))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                        .contains(subject.getTitulli()));
    }
}
