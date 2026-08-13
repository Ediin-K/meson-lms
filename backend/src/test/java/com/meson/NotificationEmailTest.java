package com.meson;

import com.meson.entity.*;
import com.meson.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Grade-posted and enrollment-confirmed emails. mail.enabled is forced on just for this
 * test class (default is off everywhere else); JavaMailSender is mocked so nothing real sends.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "mail.enabled=true")
class NotificationEmailTest {

    private static final String TEACHER_EMAIL = "notifyteacher@test.com";
    private static final String STUDENT_EMAIL = "notifystudent@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired GradeRepository gradeRepository;
    @Autowired GradeAuditLogRepository gradeAuditLogRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired AcademicTermRepository academicTermRepository;

    @MockitoBean
    JavaMailSender mailSender;

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
        academicTermRepository.deleteAll();

        teacher = newUser("Teacher", TEACHER_EMAIL, "TEACHER");
        student = newUser("Student", STUDENT_EMAIL, "STUDENT");

        subject = new Subject();
        subject.setTitulli("Notify Subject " + System.nanoTime());
        subject.setPershkrimi("desc");
        subject.setTeacher(teacher);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);

        LocalDateTime now = LocalDateTime.now();
        academicTermRepository.save(AcademicTerm.builder()
                .name("Notify Test Term")
                .active(true)
                .enrollmentStart(now.minusDays(1))
                .enrollmentEnd(now.plusDays(1))
                .examApplicationStart(now.minusDays(1))
                .examApplicationEnd(now.plusDays(1))
                .build());
    }

    @AfterEach
    void tearDown() {
        gradeAuditLogRepository.deleteAll();
        gradeRepository.deleteAll();
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

    private void enrollStudent() {
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(student);
        enrollment.setSubject(subject);
        enrollment.setStatusi(EnrollmentStatus.AKTIV);
        enrollment.setDataRegjistrimit(LocalDateTime.now());
        enrollmentRepository.save(enrollment);
    }

    @Test
    @WithMockUser(username = TEACHER_EMAIL, roles = "TEACHER")
    void postingAGradeEmailsTheStudent() throws Exception {
        enrollStudent();

        mockMvc.perform(post("/api/grades").contentType("application/json")
                        .content("{\"studentId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + ",\"grade\":9}"))
                .andExpect(status().isCreated());

        var captor = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly(STUDENT_EMAIL);
        assertThat(sent.getText()).contains("9");
        assertThat(sent.getText()).contains(subject.getTitulli());
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void enrollingEmailsTheStudent() throws Exception {
        mockMvc.perform(post("/api/enrollments").contentType("application/json")
                        .content("{\"userId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + "}"))
                .andExpect(status().isCreated());

        var captor = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly(STUDENT_EMAIL);
        assertThat(sent.getText()).contains(subject.getTitulli());
    }

    @Test
    @WithMockUser(username = TEACHER_EMAIL, roles = "TEACHER")
    void gradeIsStillPostedEvenWhenEmailSendingFails() throws Exception {
        enrollStudent();
        doThrow(new MailSendException("smtp refused")).when(mailSender).send(any(SimpleMailMessage.class));

        mockMvc.perform(post("/api/grades").contentType("application/json")
                        .content("{\"studentId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + ",\"grade\":7}"))
                .andExpect(status().isCreated());

        assertThat(gradeRepository.findByStudentId(student.getId())).hasSize(1);
    }
}
