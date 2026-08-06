package com.meson;

import com.meson.entity.*;
import com.meson.entity.Module;
import com.meson.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Covers the Phase 1 access-control fixes: EnrollmentController role/ownership gating,
 * self-enrollment identity substitution, and AssignmentService's enrollment check.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EnrollmentAccessControlTest {

    private static final String ADMIN_EMAIL = "admin@test.com";
    private static final String STUDENT1_EMAIL = "student1@test.com";
    private static final String STUDENT2_EMAIL = "student2@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired ModuleRepository moduleRepository;
    @Autowired LessonRepository lessonRepository;
    @Autowired AssignmentRepository assignmentRepository;
    @Autowired AssignmentSubmissionRepository submissionRepository;
    @Autowired AcademicTermRepository academicTermRepository;

    private User student1;
    private User student2;
    private Subject subject;
    private Subject subject2;

    @BeforeEach
    void setUp() {
        submissionRepository.deleteAll();
        assignmentRepository.deleteAll();
        lessonRepository.deleteAll();
        moduleRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();
        academicTermRepository.deleteAll();

        LocalDateTime now = LocalDateTime.now();
        academicTermRepository.save(AcademicTerm.builder()
                .name("Test Term")
                .active(true)
                .enrollmentStart(now.minusDays(1))
                .enrollmentEnd(now.plusDays(1))
                .examApplicationStart(now.minusDays(1))
                .examApplicationEnd(now.plusDays(1))
                .build());

        User teacher = newUser("Teacher", "teacher@test.com", "TEACHER");
        newUser("Admin", ADMIN_EMAIL, "ADMIN");
        student1 = newUser("Student1", STUDENT1_EMAIL, "STUDENT");
        student2 = newUser("Student2", STUDENT2_EMAIL, "STUDENT");

        subject = newSubject(teacher, "Subject A " + System.nanoTime());
        subject2 = newSubject(teacher, "Subject B " + System.nanoTime());

        enroll(student1, subject);
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

    private Subject newSubject(User teacher, String title) {
        Subject s = new Subject();
        s.setTitulli(title);
        s.setPershkrimi("desc");
        s.setTeacher(teacher);
        s.setSemester(1);
        s.setEcts(5);
        s.setCreatedAt(LocalDateTime.now());
        return subjectRepository.save(s);
    }

    private void enroll(User u, Subject s) {
        Enrollment e = new Enrollment();
        e.setUser(u);
        e.setSubject(s);
        e.setStatusi(EnrollmentStatus.AKTIV);
        e.setDataRegjistrimit(LocalDateTime.now());
        enrollmentRepository.save(e);
    }

    // ---- getAll / paged: admin-only ----

    @Test
    @WithMockUser(username = STUDENT1_EMAIL, roles = "STUDENT")
    void nonAdminCannotListAllEnrollments() throws Exception {
        mockMvc.perform(get("/api/enrollments"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminCanListAllEnrollments() throws Exception {
        mockMvc.perform(get("/api/enrollments"))
                .andExpect(status().isOk());
    }

    // ---- getByUserId: self or admin ----

    @Test
    @WithMockUser(username = STUDENT1_EMAIL, roles = "STUDENT")
    void studentCannotViewAnotherUsersEnrollments() throws Exception {
        mockMvc.perform(get("/api/enrollments/user/" + student2.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = STUDENT1_EMAIL, roles = "STUDENT")
    void studentCanViewOwnEnrollments() throws Exception {
        mockMvc.perform(get("/api/enrollments/user/" + student1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(student1.getId()));
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminCanViewAnyUsersEnrollments() throws Exception {
        mockMvc.perform(get("/api/enrollments/user/" + student1.getId()))
                .andExpect(status().isOk());
    }

    // ---- create: identity substitution for non-admins, trusted body for admin ----

    @Test
    @WithMockUser(username = STUDENT2_EMAIL, roles = "STUDENT")
    void studentSelfEnrollIgnoresForgedUserId() throws Exception {
        mockMvc.perform(post("/api/enrollments").contentType("application/json")
                        .content("{\"userId\":" + student1.getId() + ",\"subjectId\":" + subject2.getId() + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(student2.getId()));
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminCanEnrollAnotherUser() throws Exception {
        mockMvc.perform(post("/api/enrollments").contentType("application/json")
                        .content("{\"userId\":" + student2.getId() + ",\"subjectId\":" + subject2.getId() + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(student2.getId()));
    }

    // ---- statusi / progresi / delete: admin-only ----

    @Test
    @WithMockUser(username = STUDENT1_EMAIL, roles = "STUDENT")
    void nonAdminCannotUpdateEnrollmentStatus() throws Exception {
        Enrollment e = enrollmentRepository.findByUserIdAndSubjectId(student1.getId(), subject.getId()).orElseThrow();
        mockMvc.perform(patch("/api/enrollments/" + e.getId() + "/statusi").param("statusi", "ANULUAR"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = STUDENT1_EMAIL, roles = "STUDENT")
    void nonAdminCannotDeleteEnrollment() throws Exception {
        Enrollment e = enrollmentRepository.findByUserIdAndSubjectId(student1.getId(), subject.getId()).orElseThrow();
        mockMvc.perform(delete("/api/enrollments/" + e.getId()))
                .andExpect(status().isForbidden());
    }

    // ---- AssignmentService.submit(): must be actively enrolled in the assignment's subject ----

    @Test
    @WithMockUser(username = STUDENT2_EMAIL, roles = "STUDENT")
    void unenrolledStudentCannotSubmitAssignment() throws Exception {
        Module module = new Module();
        module.setTitulli("Module 1");
        module.setPershkrimi("desc");
        module.setRradhitja(1);
        module.setSubject(subject);
        module.setCreatedAt(LocalDateTime.now());
        module = moduleRepository.save(module);

        Lesson lesson = new Lesson();
        lesson.setTitulli("Lesson 1");
        lesson.setLloji(LessonType.ASSIGNMENT);
        lesson.setRradhitja(1);
        lesson.setModule(module);
        lesson.setCreatedAt(LocalDateTime.now());
        lesson = lessonRepository.save(lesson);

        Assignment a = Assignment.builder()
                .lesson(lesson)
                .title("Detyra 1")
                .description("desc")
                .deadline(java.time.Instant.now().plus(1, java.time.temporal.ChronoUnit.DAYS))
                .build();
        a = assignmentRepository.save(a);

        // student2 is not enrolled in `subject`
        MockMultipartFile file = new MockMultipartFile("file", "work.pdf", "application/pdf", "data".getBytes());
        mockMvc.perform(multipart("/api/assignments/" + a.getId() + "/submit").file(file))
                .andExpect(status().isBadRequest());

        assertThatNoSubmissionWasStored(a.getId());
    }

    private void assertThatNoSubmissionWasStored(Long assignmentId) {
        org.assertj.core.api.Assertions.assertThat(submissionRepository.findByAssignmentId(assignmentId)).isEmpty();
    }
}
