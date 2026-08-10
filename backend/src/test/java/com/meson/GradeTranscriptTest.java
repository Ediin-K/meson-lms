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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Transcript summary: ECTS-weighted GPA (not a flat average) and per-semester grouping. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GradeTranscriptTest {

    private static final String STUDENT_EMAIL = "transcriptstudent@test.com";
    private static final String ADMIN_EMAIL = "transcriptadmin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired GradeRepository gradeRepository;

    private User student;
    private User teacher;

    @BeforeEach
    void setUp() {
        gradeRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();

        teacher = newUser("Teacher", "transcriptteacher@test.com", "TEACHER");
        student = newUser("Student", STUDENT_EMAIL, "STUDENT");
        newUser("Admin", ADMIN_EMAIL, "ADMIN");
    }

    @AfterEach
    void tearDown() {
        gradeRepository.deleteAll();
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

    private Subject newSubject(int semester, int ects) {
        Subject s = new Subject();
        s.setTitulli("Subject " + semester + "-" + ects + "-" + System.nanoTime());
        s.setPershkrimi("desc");
        s.setTeacher(teacher);
        s.setSemester(semester);
        s.setEcts(ects);
        s.setCreatedAt(LocalDateTime.now());
        return subjectRepository.save(s);
    }

    private void grade(Subject subject, int value) {
        gradeRepository.save(Grade.builder()
                .student(student)
                .subject(subject)
                .professor(teacher)
                .grade(value)
                .assignedAt(LocalDateTime.now())
                .build());
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void averageIsEctsWeightedNotFlat() throws Exception {
        // 10 in a 6-ECTS course, 6 in a 2-ECTS course.
        // Flat average would be 8.0; ECTS-weighted is (10*6 + 6*2) / 8 = 9.0.
        grade(newSubject(1, 6), 10);
        grade(newSubject(1, 2), 6);

        mockMvc.perform(get("/api/grades/student/" + student.getId()))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String body = result.getResponse().getContentAsString();
                    assertThat(body).contains("\"averageGrade\":9.0");
                });
    }

    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void gradesAreGroupedBySubjectSemester() throws Exception {
        grade(newSubject(1, 6), 10);
        grade(newSubject(1, 4), 8);
        grade(newSubject(2, 5), 7);

        mockMvc.perform(get("/api/grades/student/" + student.getId()))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String body = result.getResponse().getContentAsString();
                    // Semester 1: (10*6 + 8*4) / 10 = 9.2; Semester 2: single grade of 7.
                    assertThat(body).contains("\"semester\":1");
                    assertThat(body).contains("\"gpa\":9.2");
                    assertThat(body).contains("\"semester\":2");
                    assertThat(body).contains("\"gpa\":7.0");
                });
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminCanViewAnyStudentsTranscript() throws Exception {
        grade(newSubject(1, 5), 9);

        mockMvc.perform(get("/api/grades/student/" + student.getId()))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).contains("\"totalGrades\":1"));
    }
}
