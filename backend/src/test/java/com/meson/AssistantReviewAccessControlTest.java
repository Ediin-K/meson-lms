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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Assistant review endpoints are scoped to the subjects a TEACHER assists on (via
 * subject_subgroup_teachers). The subject's own teacher — if not also an assistant —
 * cannot use the assistant endpoints, but can read the reviews for their students.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AssistantReviewAccessControlTest {

    private static final String OWNER = "ar.owner@test.com";
    private static final String ASSISTANT = "ar.assistant@test.com";
    private static final String OTHER_TEACHER = "ar.other@test.com";
    private static final String STUDENT = "ar.student@test.com";
    private static final String ADMIN = "ar.admin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired SubjectGroupRepository subjectGroupRepository;
    @Autowired SubjectSubgroupRepository subjectSubgroupRepository;
    @Autowired SubjectSubgroupTeacherRepository subjectSubgroupTeacherRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired AssistantReviewRepository assistantReviewRepository;

    private User assistant;
    private User student;
    private Subject subject;

    @BeforeEach
    void setUp() {
        cleanUp();

        User owner = user("Owner", OWNER);
        assistant = user("Assistant", ASSISTANT);
        user("Other", OTHER_TEACHER);
        student = user("Student", STUDENT);
        user("Admin", ADMIN);

        Department dept = new Department();
        dept.setEmertimi("AR Dept " + System.nanoTime());
        dept.setPershkrimi("d");
        dept.setNumSemesters(6);
        dept = departmentRepository.save(dept);

        subject = new Subject();
        subject.setTitulli("AR Subject " + System.nanoTime());
        subject.setPershkrimi("d");
        subject.setTeacher(owner);
        subject.setDepartment(dept);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);

        SubjectGroup group = subjectGroupRepository.save(SubjectGroup.builder()
                .subject(subject).name("Group A").build());
        SubjectSubgroup subgroup = subjectSubgroupRepository.save(SubjectSubgroup.builder()
                .subjectGroup(group).name("Section 1").build());
        subjectSubgroupTeacherRepository.save(SubjectSubgroupTeacher.builder()
                .subjectSubgroup(subgroup).teacher(assistant).role("ASSISTANT").build());

        Enrollment e = new Enrollment();
        e.setUser(student);
        e.setSubject(subject);
        e.setSubjectSubgroup(subgroup);
        e.setStatusi(EnrollmentStatus.AKTIV);
        e.setDataRegjistrimit(LocalDateTime.now());
        enrollmentRepository.save(e);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        assistantReviewRepository.deleteAll();
        enrollmentRepository.deleteAll();
        subjectSubgroupTeacherRepository.deleteAll();
        subjectSubgroupRepository.deleteAll();
        subjectGroupRepository.deleteAll();
        subjectRepository.findAll().stream()
                .filter(s -> s.getTitulli() != null && s.getTitulli().startsWith("AR Subject"))
                .forEach(subjectRepository::delete);
        departmentRepository.findAll().stream()
                .filter(d -> d.getEmertimi() != null && d.getEmertimi().startsWith("AR Dept"))
                .forEach(departmentRepository::delete);
        for (String email : new String[]{OWNER, ASSISTANT, OTHER_TEACHER, STUDENT, ADMIN}) {
            userRepository.findByEmail(email).ifPresent(userRepository::delete);
        }
    }

    private User user(String name, String email) {
        User u = new User();
        u.setEmri(name);
        u.setMbiemri("Test");
        u.setEmail(email);
        u.setPasswordHash("x");
        return userRepository.save(u);
    }

    private String reviewBody(String date, Integer stars, String comment) {
        return "{" + (date == null ? "\"reviewDate\":null" : "\"reviewDate\":\"" + date + "\"")
                + (stars == null ? "" : ",\"stars\":" + stars)
                + (comment == null ? "" : ",\"comment\":\"" + comment + "\"") + "}";
    }

    private long postReview(String body) throws Exception {
        MvcResult r = mockMvc.perform(post("/api/assistant/subjects/" + subject.getId()
                        + "/students/" + student.getId() + "/reviews")
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString()).get("id").asLong();
    }

    // ── Happy path ─────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = ASSISTANT, roles = "TEACHER")
    void assistantSeesTheirSubjectAndRoster() throws Exception {
        mockMvc.perform(get("/api/assistant/subjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subjectId").value(subject.getId()))
                .andExpect(jsonPath("$[0].studentCount").value(1));

        mockMvc.perform(get("/api/assistant/subjects/" + subject.getId() + "/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(student.getId()));
    }

    @Test
    @WithMockUser(username = ASSISTANT, roles = "TEACHER")
    void assistantCreatesEditsAndDeletesADatedNote() throws Exception {
        long id = postReview(reviewBody("2026-05-12", 5, "active today"));

        mockMvc.perform(get("/api/assistant/subjects/" + subject.getId()
                        + "/students/" + student.getId() + "/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(put("/api/assistant/reviews/" + id)
                        .contentType("application/json").content(reviewBody("2026-05-12", 4, "revised")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stars").value(4));

        mockMvc.perform(delete("/api/assistant/reviews/" + id)).andExpect(status().isNoContent());
        assertThat(assistantReviewRepository.count()).isZero();
    }

    @Test
    @WithMockUser(username = ASSISTANT, roles = "TEACHER")
    void datedNotesAreAnAppendLog_finalIsUpserted() throws Exception {
        postReview(reviewBody("2026-05-12", 5, null));
        postReview(reviewBody("2026-05-12", 3, "second look same day"));
        postReview(reviewBody(null, 4, "final A"));
        postReview(reviewBody(null, 5, "final revised"));

        assertThat(assistantReviewRepository.findAll().stream()
                .filter(r -> r.getReviewDate() == null).count()).isEqualTo(1);
        assertThat(assistantReviewRepository.findAll().stream()
                .filter(r -> r.getReviewDate() != null).count()).isEqualTo(2);
    }

    @Test
    @WithMockUser(username = ASSISTANT, roles = "TEACHER")
    void emptyReviewIsRejected() throws Exception {
        mockMvc.perform(post("/api/assistant/subjects/" + subject.getId()
                        + "/students/" + student.getId() + "/reviews")
                        .contentType("application/json").content(reviewBody("2026-05-12", null, null)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = ASSISTANT, roles = "TEACHER")
    void starsOutOfRangeIsRejected() throws Exception {
        mockMvc.perform(post("/api/assistant/subjects/" + subject.getId()
                        + "/students/" + student.getId() + "/reviews")
                        .contentType("application/json").content(reviewBody("2026-05-12", 9, null)))
                .andExpect(status().isBadRequest());
    }

    // ── Access control ────────────────────────────────────────────────

    @Test
    @WithMockUser(username = OWNER, roles = "TEACHER")
    void subjectOwnerWhoIsNotAnAssistantCannotUseAssistantEndpoints() throws Exception {
        mockMvc.perform(get("/api/assistant/subjects/" + subject.getId() + "/students"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = OTHER_TEACHER, roles = "TEACHER")
    void unrelatedTeacherIsForbidden() throws Exception {
        mockMvc.perform(get("/api/assistant/subjects/" + subject.getId() + "/students"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = STUDENT, roles = "STUDENT")
    void studentIsForbidden() throws Exception {
        mockMvc.perform(get("/api/assistant/subjects")).andExpect(status().isForbidden());
    }

    @Test
    void anotherAssistantCannotEditThisAssistantsReview() throws Exception {
        AssistantReview review = assistantReviewRepository.save(AssistantReview.builder()
                .assistant(assistant).student(student).subject(subject)
                .reviewDate(java.time.LocalDate.of(2026, 5, 12)).stars(5).build());

        // OTHER_TEACHER is assigned to a subgroup of the same subject too, but isn't the review's author
        SubjectGroup g = subjectGroupRepository.save(SubjectGroup.builder().subject(subject).name("Group B").build());
        SubjectSubgroup sg = subjectSubgroupRepository.save(SubjectSubgroup.builder().subjectGroup(g).name("Section 2").build());
        subjectSubgroupTeacherRepository.save(SubjectSubgroupTeacher.builder()
                .subjectSubgroup(sg).teacher(userRepository.findByEmail(OTHER_TEACHER).orElseThrow())
                .role("ASSISTANT").build());

        mockMvc.perform(put("/api/assistant/reviews/" + review.getId())
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .user(OTHER_TEACHER).roles("TEACHER"))
                        .contentType("application/json").content(reviewBody("2026-05-12", 1, "hijack")))
                .andExpect(status().isForbidden());
    }

    // ── Teacher-side read ─────────────────────────────────────────────

    @Test
    void subjectOwnerCanReadAssistantReviewsForTheirStudent() throws Exception {
        assistantReviewRepository.save(AssistantReview.builder()
                .assistant(assistant).student(student).subject(subject)
                .reviewDate(java.time.LocalDate.of(2026, 5, 12)).stars(5).comment("good").build());
        assistantReviewRepository.save(AssistantReview.builder()
                .assistant(assistant).student(student).subject(subject)
                .stars(4).comment("solid overall").build());

        mockMvc.perform(get("/api/teacher/subjects/" + subject.getId()
                        + "/students/" + student.getId() + "/assistant-reviews")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .user(OWNER).roles("TEACHER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dated.length()").value(1))
                .andExpect(jsonPath("$.finalReview.stars").value(4));
    }

    @Test
    void aDifferentTeacherCannotReadAssistantReviews() throws Exception {
        mockMvc.perform(get("/api/teacher/subjects/" + subject.getId()
                        + "/students/" + student.getId() + "/assistant-reviews")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .user(OTHER_TEACHER).roles("TEACHER")))
                .andExpect(status().isForbidden());
    }
}
