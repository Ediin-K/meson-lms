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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A subject has a teacher pool. Every pool member is a full peer for content
 * (modules/lessons/quizzes). Grading is section-scoped: a teacher grades only
 * students in the groups they teach; ungrouped students are gradable by any
 * pool member. Teachers outside the pool see and can do nothing.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SubjectTeacherAccessControlTest {

    private static final String A = "st.a@test.com";
    private static final String B = "st.b@test.com";
    private static final String C = "st.c@test.com";
    private static final String ADMIN = "st.admin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired SubjectTeacherRepository subjectTeacherRepository;
    @Autowired SubjectGroupRepository subjectGroupRepository;
    @Autowired SubjectGroupTeacherRepository subjectGroupTeacherRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired ModuleRepository moduleRepository;
    @Autowired GradeRepository gradeRepository;

    private User a, b, s1, s2, s3;
    private Subject subject;
    private SubjectGroup groupB;

    @BeforeEach
    void setUp() {
        cleanUp();
        a = user("A", A);
        b = user("B", B);
        user("C", C);
        user("Admin", ADMIN);
        s1 = user("S1", "st.s1@test.com");
        s2 = user("S2", "st.s2@test.com");
        s3 = user("S3", "st.s3@test.com");

        Department dept = new Department();
        dept.setEmertimi("ST Dept " + System.nanoTime());
        dept.setPershkrimi("d");
        dept.setNumSemesters(6);
        dept = departmentRepository.save(dept);

        subject = new Subject();
        subject.setTitulli("ST Subject " + System.nanoTime());
        subject.setPershkrimi("d");
        subject.setTeacher(a);
        subject.setDepartment(dept);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);
        subjectTeacherRepository.save(SubjectTeacher.builder().subject(subject).teacher(a).sortOrder(0).build());
        subjectTeacherRepository.save(SubjectTeacher.builder().subject(subject).teacher(b).sortOrder(1).build());

        SubjectGroup groupA = subjectGroupRepository.save(SubjectGroup.builder().subject(subject).name("G-A").build());
        groupB = subjectGroupRepository.save(SubjectGroup.builder().subject(subject).name("G-B").build());
        subjectGroupTeacherRepository.save(SubjectGroupTeacher.builder().subjectGroup(groupA).teacher(a).role("PROFESSOR").build());
        subjectGroupTeacherRepository.save(SubjectGroupTeacher.builder().subjectGroup(groupB).teacher(b).role("PROFESSOR").build());

        enroll(s1, groupA);
        enroll(s2, groupB);
        enroll(s3, null); // ungrouped
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        gradeRepository.deleteAll();
        subjectRepository.findAll().stream()
                .filter(s -> s.getTitulli() != null && s.getTitulli().startsWith("ST Subject"))
                .forEach(s -> moduleRepository.deleteAll(moduleRepository.findBySubjectId(s.getId())));
        enrollmentRepository.deleteAll();
        subjectGroupTeacherRepository.deleteAll();
        subjectGroupRepository.deleteAll();
        subjectTeacherRepository.deleteAll();
        subjectRepository.findAll().stream()
                .filter(s -> s.getTitulli() != null && s.getTitulli().startsWith("ST Subject"))
                .forEach(subjectRepository::delete);
        departmentRepository.findAll().stream()
                .filter(d -> d.getEmertimi() != null && d.getEmertimi().startsWith("ST Dept"))
                .forEach(departmentRepository::delete);
        for (String e : new String[]{A, B, C, ADMIN, "st.s1@test.com", "st.s2@test.com", "st.s3@test.com"}) {
            userRepository.findByEmail(e).ifPresent(userRepository::delete);
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

    private void enroll(User student, SubjectGroup group) {
        Enrollment e = new Enrollment();
        e.setUser(student);
        e.setSubject(subject);
        e.setSubjectGroup(group);
        e.setStatusi(EnrollmentStatus.AKTIV);
        e.setDataRegjistrimit(LocalDateTime.now());
        enrollmentRepository.save(e);
    }

    private static SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor as(String email) {
        return SecurityMockMvcRequestPostProcessors.user(email).roles("TEACHER");
    }

    private String grade(User student) {
        return "{\"studentId\":" + student.getId() + ",\"subjectId\":" + subject.getId() + ",\"grade\":9}";
    }

    // ── content: any pool member ──────────────────────────────────────

    @Test
    void poolMemberSeesTheSubjectAndCanManageContent() throws Exception {
        mockMvc.perform(get("/api/teacher/subjects").with(as(B)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + subject.getId() + ")]").exists());

        mockMvc.perform(post("/api/teacher/modules").with(as(B)).contentType("application/json")
                        .content("{\"titulli\":\"M1\",\"pershkrimi\":\"d\",\"rradhitja\":1,\"subjectId\":" + subject.getId() + "}"))
                .andExpect(status().isCreated());
    }

    @Test
    void teacherOutsideThePoolIsShutOut() throws Exception {
        mockMvc.perform(get("/api/teacher/subjects").with(as(C)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + subject.getId() + ")]").doesNotExist());

        mockMvc.perform(post("/api/teacher/modules").with(as(C)).contentType("application/json")
                        .content("{\"titulli\":\"M\",\"pershkrimi\":\"d\",\"rradhitja\":1,\"subjectId\":" + subject.getId() + "}"))
                .andExpect(status().isForbidden());
    }

    // ── grading: section-scoped ───────────────────────────────────────

    @Test
    void poolMemberGradesTheirOwnSectionAndUngroupedButNotOtherSections() throws Exception {
        mockMvc.perform(post("/api/grades").with(as(B)).contentType("application/json").content(grade(s2)))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/grades").with(as(B)).contentType("application/json").content(grade(s3)))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/grades").with(as(B)).contentType("application/json").content(grade(s1)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void adminGradesAnyone() throws Exception {
        mockMvc.perform(post("/api/grades").contentType("application/json").content(grade(s1)))
                .andExpect(status().isCreated());
    }

    @Test
    void subjectGradeListIsScopedToTheCallersSections() throws Exception {
        gradeRepository.save(Grade.builder().student(s1).subject(subject).professor(a).grade(7).assignedAt(LocalDateTime.now()).build());
        gradeRepository.save(Grade.builder().student(s2).subject(subject).professor(b).grade(8).assignedAt(LocalDateTime.now()).build());
        gradeRepository.save(Grade.builder().student(s3).subject(subject).professor(a).grade(9).assignedAt(LocalDateTime.now()).build());

        String forB = mockMvc.perform(get("/api/grades/subject/" + subject.getId()).with(as(B)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(forB).contains("\"studentId\":" + s2.getId());
        assertThat(forB).contains("\"studentId\":" + s3.getId());
        assertThat(forB).doesNotContain("\"studentId\":" + s1.getId());

        String forAdmin = mockMvc.perform(get("/api/grades/subject/" + subject.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user(ADMIN).roles("ADMIN")))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(forAdmin).contains("\"studentId\":" + s1.getId());
    }

    // ── admin: manage the pool ────────────────────────────────────────

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void cannotDropATeacherStillAssignedToAGroup() throws Exception {
        String body = subjectPut(java.util.List.of(a.getId()));
        mockMvc.perform(put("/api/subjects/" + subject.getId()).contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void droppingATeacherOnceReassignedRemovesTheirAccess() throws Exception {
        // move G-B to A
        subjectGroupTeacherRepository.deleteAll(subjectGroupTeacherRepository.findBySubjectGroupId(groupB.getId()));
        subjectGroupTeacherRepository.save(SubjectGroupTeacher.builder().subjectGroup(groupB).teacher(a).role("PROFESSOR").build());

        mockMvc.perform(put("/api/subjects/" + subject.getId()).contentType("application/json")
                        .content(subjectPut(java.util.List.of(a.getId()))))
                .andExpect(status().isOk());

        assertThat(subjectTeacherRepository.existsBySubjectIdAndTeacherId(subject.getId(), b.getId())).isFalse();
        mockMvc.perform(get("/api/teacher/subjects").with(as(B)))
                .andExpect(jsonPath("$[?(@.id == " + subject.getId() + ")]").doesNotExist());
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void subjectCannotBeLeftWithNoTeachers() throws Exception {
        mockMvc.perform(put("/api/subjects/" + subject.getId()).contentType("application/json")
                        .content(subjectPut(java.util.List.of())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = ADMIN, roles = "ADMIN")
    void creatingASubjectWithoutAnEnrollmentKeyIsRejected() throws Exception {
        String body = "{\"titulli\":\"ST Subject NoKey " + System.nanoTime() + "\",\"pershkrimi\":\"d\","
                + "\"teacherIds\":[" + a.getId() + "],\"departmentId\":" + subject.getDepartment().getId()
                + ",\"semester\":1,\"ects\":5}";
        mockMvc.perform(post("/api/subjects").contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
    }

    private String subjectPut(java.util.List<Long> teacherIds) {
        String ids = teacherIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(","));
        return "{\"titulli\":\"" + subject.getTitulli() + "\",\"pershkrimi\":\"d\",\"teacherIds\":[" + ids + "],"
                + "\"departmentId\":" + subject.getDepartment().getId() + ",\"semester\":1,\"ects\":5,"
                + "\"enrollmentKey\":\"KEY-ST\"}";
    }
}
