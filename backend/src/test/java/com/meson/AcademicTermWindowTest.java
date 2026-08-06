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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Enrollment and exam-application windows: gated by the active AcademicTerm, admins bypass. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AcademicTermWindowTest {

    private static final String STUDENT_EMAIL = "termstudent@test.com";
    private static final String ADMIN_EMAIL = "termadmin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired AcademicTermRepository academicTermRepository;
    @Autowired ExamApplicationRepository examApplicationRepository;

    private User student;
    private User teacher;
    private Subject subject;

    @BeforeEach
    void setUp() {
        examApplicationRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();
        academicTermRepository.deleteAll();

        teacher = newUser("Teacher", "termteacher@test.com", "TEACHER");
        student = newUser("Student", STUDENT_EMAIL, "STUDENT");
        newUser("Admin", ADMIN_EMAIL, "ADMIN");

        subject = new Subject();
        subject.setTitulli("Term Window Subject " + System.nanoTime());
        subject.setPershkrimi("desc");
        subject.setTeacher(teacher);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);
    }

    // Other test classes sharing this H2 instance clean up only their own tables at the
    // start of setUp(); an exam-application row left behind by us would break their
    // subject/user cleanup with an FK violation, so we clean up everything we created.
    @AfterEach
    void tearDown() {
        examApplicationRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();
        academicTermRepository.deleteAll();
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

    private void saveTerm(LocalDateTime enrollmentStart, LocalDateTime enrollmentEnd,
                           LocalDateTime examStart, LocalDateTime examEnd) {
        academicTermRepository.save(AcademicTerm.builder()
                .name("Window Test Term")
                .active(true)
                .enrollmentStart(enrollmentStart)
                .enrollmentEnd(enrollmentEnd)
                .examApplicationStart(examStart)
                .examApplicationEnd(examEnd)
                .build());
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void studentEnrollmentRejectedWithNoActiveTerm() throws Exception {
        mockMvc.perform(post("/api/enrollments").contentType("application/json")
                        .content("{\"userId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + "}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void studentEnrollmentRejectedWhenWindowClosed() throws Exception {
        LocalDateTime now = LocalDateTime.now();
        saveTerm(now.minusDays(10), now.minusDays(5), now.minusDays(10), now.minusDays(5));

        mockMvc.perform(post("/api/enrollments").contentType("application/json")
                        .content("{\"userId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + "}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void studentEnrollmentSucceedsWhenWindowOpen() throws Exception {
        LocalDateTime now = LocalDateTime.now();
        saveTerm(now.minusDays(1), now.plusDays(1), now.minusDays(1), now.plusDays(1));

        mockMvc.perform(post("/api/enrollments").contentType("application/json")
                        .content("{\"userId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + "}"))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminEnrollmentBypassesWindow() throws Exception {
        mockMvc.perform(post("/api/enrollments").contentType("application/json")
                        .content("{\"userId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + "}"))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void studentExamApplicationRejectedWithNoActiveTerm() throws Exception {
        mockMvc.perform(post("/api/smis/students/" + student.getId() + "/exam-applications")
                        .contentType("application/json")
                        .content("{\"courseId\":" + subject.getId() + ",\"professorId\":" + teacher.getId() + "}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void studentExamApplicationSucceedsWhenWindowOpen() throws Exception {
        LocalDateTime now = LocalDateTime.now();
        saveTerm(now.minusDays(1), now.plusDays(1), now.minusDays(1), now.plusDays(1));

        mockMvc.perform(post("/api/smis/students/" + student.getId() + "/exam-applications")
                        .contentType("application/json")
                        .content("{\"courseId\":" + subject.getId() + ",\"professorId\":" + teacher.getId() + "}"))
                .andExpect(status().isCreated());
    }
}
