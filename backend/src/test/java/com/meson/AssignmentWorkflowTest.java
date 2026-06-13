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
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AssignmentWorkflowTest {

    private static final String TEACHER_EMAIL = "teacher@test.com";
    private static final String STUDENT_EMAIL = "student@test.com";

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

    @BeforeEach
    void setUp() {
        submissionRepository.deleteAll();
        assignmentRepository.deleteAll();
        enrollmentRepository.deleteAll();
        lessonRepository.deleteAll();
        moduleRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();

        User teacher = newUser("Teacher", TEACHER_EMAIL, "TEACHER");
        student = newUser("Student", STUDENT_EMAIL, "STUDENT");
        User student2 = newUser("Student2", "student2@test.com", "STUDENT");

        Subject subject = new Subject();
        subject.setTitulli("Test Subject " + System.nanoTime());
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
        enroll(student2, subject);
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

    private Assignment createAssignment(Instant deadline) {
        Assignment a = Assignment.builder()
                .lesson(lesson)
                .title("Detyra 1")
                .description("Pershkrim")
                .deadline(deadline)
                .build();
        return assignmentRepository.save(a);
    }

    private MvcResult submitFile(Long assignmentId, String filename, byte[] content) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", filename, "application/pdf", content);
        return mockMvc.perform(multipart("/api/assignments/" + assignmentId + "/submit").file(file))
                .andReturn();
    }

    // Student dashboard: cross-subject overview with status
    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void studentOverviewListsAssignmentsWithStatus() throws Exception {
        Assignment a = createAssignment(Instant.now().plus(1, ChronoUnit.DAYS));

        mockMvc.perform(get("/api/assignments/my-overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("UPCOMING"))
                .andExpect(jsonPath("$[0].subjectTitle").isNotEmpty())
                .andExpect(jsonPath("$[0].deadline").isNotEmpty());

        submitFile(a.getId(), "work.pdf", "data".getBytes());

        mockMvc.perform(get("/api/assignments/my-overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("SUBMITTED"));
    }

    // 1. Teacher creates assignment with title/description/deadline (UTC)
    @Test
    @WithMockUser(username = TEACHER_EMAIL, roles = "TEACHER")
    void teacherCreatesAssignment() throws Exception {
        Instant deadline = Instant.now().plus(2, ChronoUnit.DAYS).truncatedTo(ChronoUnit.SECONDS);
        mockMvc.perform(post("/api/teacher/assignments")
                        .contentType("application/json")
                        .content("{\"title\":\"HW 1\",\"description\":\"Read ch. 3\"," +
                                "\"deadline\":\"" + deadline + "\",\"lessonId\":" + lesson.getId() + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("HW 1"))
                .andExpect(jsonPath("$.description").value("Read ch. 3"))
                .andExpect(jsonPath("$.isOpen").value(true));

        Assignment saved = assignmentRepository.findByLessonId(lesson.getId()).orElseThrow();
        assertThat(saved.getDeadline()).isEqualTo(deadline);
    }

    // 2. On-time submission succeeds, stored under uploads/assignments/{assignmentId}/{studentId}/
    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void onTimeSubmissionSucceeds() throws Exception {
        Assignment a = createAssignment(Instant.now().plus(1, ChronoUnit.DAYS));
        MvcResult res = submitFile(a.getId(), "homework.pdf", "pdf-bytes".getBytes());
        assertThat(res.getResponse().getStatus()).isEqualTo(200);
        assertThat(res.getResponse().getContentAsString())
                .contains("\"late\":false")
                .contains("\"status\":\"SUBMITTED\"");

        AssignmentSubmission sub = submissionRepository
                .findByAssignmentIdAndStudentId(a.getId(), student.getId()).orElseThrow();
        assertThat(sub.isLate()).isFalse();
        assertThat(sub.getFilePath()).startsWith("assignments/" + a.getId() + "/" + student.getId() + "/");
        Path stored = Paths.get("target/test-uploads").resolve(sub.getFilePath());
        assertThat(Files.exists(stored)).isTrue();
        assertThat(Files.readAllBytes(stored)).isEqualTo("pdf-bytes".getBytes());
    }

    // 3. Late submission accepted but flagged
    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void lateSubmissionAcceptedAndFlagged() throws Exception {
        Assignment a = createAssignment(Instant.now().minus(1, ChronoUnit.HOURS));
        MvcResult res = submitFile(a.getId(), "late.pdf", "late".getBytes());
        assertThat(res.getResponse().getStatus()).isEqualTo(200);
        assertThat(res.getResponse().getContentAsString())
                .contains("\"late\":true")
                .contains("\"status\":\"LATE\"");

        AssignmentSubmission sub = submissionRepository
                .findByAssignmentIdAndStudentId(a.getId(), student.getId()).orElseThrow();
        assertThat(sub.isLate()).isTrue();
    }

    // 4. Resubmission before deadline replaces file, preserves first-submission timestamp
    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void resubmissionReplacesFilePreservingAuditTrail() throws Exception {
        Assignment a = createAssignment(Instant.now().plus(1, ChronoUnit.DAYS));
        submitFile(a.getId(), "v1.pdf", "version-1".getBytes());

        AssignmentSubmission first = submissionRepository
                .findByAssignmentIdAndStudentId(a.getId(), student.getId()).orElseThrow();
        Instant firstAt = first.getFirstSubmittedAt();
        String oldPath = first.getFilePath();

        Thread.sleep(50);
        MvcResult res = submitFile(a.getId(), "v2.pdf", "version-2".getBytes());
        assertThat(res.getResponse().getStatus()).isEqualTo(200);

        AssignmentSubmission second = submissionRepository
                .findByAssignmentIdAndStudentId(a.getId(), student.getId()).orElseThrow();
        assertThat(second.getId()).isEqualTo(first.getId());
        assertThat(second.getFileName()).isEqualTo("v2.pdf");
        assertThat(second.getFirstSubmittedAt()).isEqualTo(firstAt);
        assertThat(second.getSubmittedAt()).isAfter(firstAt);
        // old file removed, new file holds new content
        assertThat(Files.exists(Paths.get("target/test-uploads").resolve(oldPath))).isFalse();
        assertThat(Files.readAllBytes(Paths.get("target/test-uploads").resolve(second.getFilePath())))
                .isEqualTo("version-2".getBytes());
    }

    // 4b. Resubmission after the deadline is rejected (existing submission is kept)
    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void resubmissionAfterDeadlineRejected() throws Exception {
        Assignment a = createAssignment(Instant.now().plus(2, ChronoUnit.SECONDS));
        submitFile(a.getId(), "v1.pdf", "version-1".getBytes());

        a.setDeadline(Instant.now().minus(1, ChronoUnit.MINUTES));
        assignmentRepository.save(a);

        MvcResult res = submitFile(a.getId(), "v2.pdf", "version-2".getBytes());
        assertThat(res.getResponse().getStatus()).isNotEqualTo(200);
        AssignmentSubmission sub = submissionRepository
                .findByAssignmentIdAndStudentId(a.getId(), student.getId()).orElseThrow();
        assertThat(sub.getFileName()).isEqualTo("v1.pdf");
    }

    // 5. Disallowed extension rejected
    @Test
    @WithMockUser(username = STUDENT_EMAIL, roles = "STUDENT")
    void disallowedExtensionRejected() throws Exception {
        Assignment a = createAssignment(Instant.now().plus(1, ChronoUnit.DAYS));
        MockMultipartFile file = new MockMultipartFile("file", "virus.exe", "application/octet-stream", "x".getBytes());
        MvcResult res = mockMvc.perform(multipart("/api/assignments/" + a.getId() + "/submit").file(file)).andReturn();
        assertThat(res.getResponse().getStatus()).isNotEqualTo(200);
        assertThat(submissionRepository.findByAssignmentId(a.getId())).isEmpty();
    }
}
