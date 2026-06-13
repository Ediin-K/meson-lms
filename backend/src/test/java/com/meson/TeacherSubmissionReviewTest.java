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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TeacherSubmissionReviewTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired ModuleRepository moduleRepository;
    @Autowired LessonRepository lessonRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired AssignmentRepository assignmentRepository;
    @Autowired AssignmentSubmissionRepository submissionRepository;

    private Lesson lesson;
    private User student;
    private Assignment assignment;

    private RequestPostProcessor asTeacher() {
        return SecurityMockMvcRequestPostProcessors.user("rev-teacher@test.com").roles("TEACHER");
    }

    private RequestPostProcessor asStudent() {
        return SecurityMockMvcRequestPostProcessors.user("rev-student@test.com").roles("STUDENT");
    }

    @BeforeEach
    void setUp() {
        submissionRepository.deleteAll();
        assignmentRepository.deleteAll();
        enrollmentRepository.deleteAll();
        lessonRepository.deleteAll();
        moduleRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();

        User teacher = newUser("Teacher", "rev-teacher@test.com", "TEACHER");
        student = newUser("Student", "rev-student@test.com", "STUDENT");
        User noSubmit = newUser("Lazy", "rev-lazy@test.com", "STUDENT");

        Subject subject = new Subject();
        subject.setTitulli("Review Subject " + System.nanoTime());
        subject.setPershkrimi("desc");
        subject.setTeacher(teacher);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);

        Module module = new Module();
        module.setTitulli("Module 1");
        module.setPershkrimi("desc");
        module.setRradhitja(1);
        module.setSubject(subject);
        module.setCreatedAt(LocalDateTime.now());
        module = moduleRepository.save(module);

        lesson = new Lesson();
        lesson.setTitulli("Lesson 1");
        lesson.setLloji(LessonType.ASSIGNMENT);
        lesson.setRradhitja(1);
        lesson.setModule(module);
        lesson.setCreatedAt(LocalDateTime.now());
        lesson = lessonRepository.save(lesson);

        enroll(student, subject);
        enroll(noSubmit, subject);

        assignment = assignmentRepository.save(Assignment.builder()
                .lesson(lesson)
                .title("Detyra")
                .deadline(Instant.now().plus(1, ChronoUnit.DAYS))
                .build());
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

    private void enroll(User u, Subject s) {
        Enrollment e = new Enrollment();
        e.setUser(u);
        e.setSubject(s);
        e.setStatusi(EnrollmentStatus.AKTIV);
        e.setDataRegjistrimit(LocalDateTime.now());
        enrollmentRepository.save(e);
    }

    private long submitAsStudent(String filename, byte[] content) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", filename, "application/pdf", content);
        mockMvc.perform(multipart("/api/assignments/" + assignment.getId() + "/submit")
                        .file(file).with(asStudent()))
                .andExpect(status().isOk());
        return submissionRepository
                .findByAssignmentIdAndStudentId(assignment.getId(), student.getId())
                .orElseThrow().getId();
    }

    // 6. Submission list shows submitted + not-submitted students with status
    @Test
    void teacherSeesSubmissionListWithStatuses() throws Exception {
        submitAsStudent("hw.pdf", "data".getBytes());

        mockMvc.perform(get("/api/teacher/assignments/" + assignment.getId() + "/submissions")
                        .with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.studentEmail=='rev-student@test.com')].status").value("SUBMITTED"))
                .andExpect(jsonPath("$[?(@.studentEmail=='rev-lazy@test.com')].status").value("NOT_SUBMITTED"));
    }

    // 7. Preview (inline, correct content type) and download return the stored file
    @Test
    void teacherPreviewAndDownloadReturnFile() throws Exception {
        long subId = submitAsStudent("hw.pdf", "pdf-content".getBytes());

        MvcResult preview = mockMvc.perform(get("/api/teacher/submissions/" + subId + "/preview")
                        .with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"hw.pdf\""))
                .andExpect(content().contentType("application/pdf"))
                .andReturn();
        assertThat(preview.getResponse().getContentAsByteArray()).isEqualTo("pdf-content".getBytes());

        MvcResult download = mockMvc.perform(get("/api/teacher/submissions/" + subId + "/file")
                        .with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"hw.pdf\""))
                .andReturn();
        assertThat(download.getResponse().getContentAsByteArray()).isEqualTo("pdf-content".getBytes());
    }

    // 8 & 9. Teacher grades; grade/feedback visible to the student
    @Test
    void gradeAndFeedbackVisibleToStudent() throws Exception {
        long subId = submitAsStudent("hw.pdf", "data".getBytes());

        mockMvc.perform(put("/api/teacher/submissions/" + subId + "/grade")
                        .contentType("application/json")
                        .content("{\"grade\": 92.5, \"feedback\": \"Punë e mirë!\"}")
                        .with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.grade").value(92.5))
                .andExpect(jsonPath("$.status").value("GRADED"));

        mockMvc.perform(get("/api/assignments/" + assignment.getId() + "/my-submission")
                        .with(asStudent()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.grade").value(92.5))
                .andExpect(jsonPath("$.feedback").value("Punë e mirë!"))
                .andExpect(jsonPath("$.status").value("GRADED"));
    }

    // Graded submission cannot be replaced
    @Test
    void gradedSubmissionCannotBeReplaced() throws Exception {
        long subId = submitAsStudent("hw.pdf", "data".getBytes());
        mockMvc.perform(put("/api/teacher/submissions/" + subId + "/grade")
                        .contentType("application/json")
                        .content("{\"grade\": 80}")
                        .with(asTeacher()))
                .andExpect(status().isOk());

        MockMultipartFile file = new MockMultipartFile("file", "v2.pdf", "application/pdf", "x".getBytes());
        MvcResult res = mockMvc.perform(multipart("/api/assignments/" + assignment.getId() + "/submit")
                        .file(file).with(asStudent()))
                .andReturn();
        assertThat(res.getResponse().getStatus()).isNotEqualTo(200);
    }
}
