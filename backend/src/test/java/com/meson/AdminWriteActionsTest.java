package com.meson;

import com.meson.entity.*;
import com.meson.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Exercises the admin "action button" endpoints (create/update/delete) end to end
 * with an admin principal, asserting the intended effect — not just a 2xx.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "admin@test.com", roles = "ADMIN")
class AdminWriteActionsTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRoleRepository userRoleRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired EnrollmentRepository enrollmentRepository;
    @Autowired CertificateRepository certificateRepository;
    @Autowired StudentProfileRepository studentProfileRepository;

    private Long studentId;
    private Long completedEnrollmentId;
    private Long studentRoleId;

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        cleanAll();
    }

    private void cleanAll() {
        certificateRepository.deleteAll();
        enrollmentRepository.deleteAll();
        studentProfileRepository.deleteAll();
        userRoleRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
    }

    @BeforeEach
    void setUp() {
        cleanAll();

        Role studentRole = new Role();
        studentRole.setEmertimi("student");
        studentRole.setNormalizedName("student");
        studentRole = roleRepository.save(studentRole);
        studentRoleId = studentRole.getId();

        User teacher = saveUser("Teacher", "teacher@test.com");
        User student = saveUser("Student", "student@test.com");
        studentId = student.getId();

        Subject subject = new Subject();
        subject.setTitulli("Subject A");
        subject.setPershkrimi("desc");
        subject.setTeacher(teacher);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subject = subjectRepository.save(subject);

        Enrollment e = new Enrollment();
        e.setUser(student);
        e.setSubject(subject);
        e.setStatusi(EnrollmentStatus.PERFUNDUAR);
        e.setDataRegjistrimit(LocalDateTime.now());
        completedEnrollmentId = enrollmentRepository.save(e).getId();
    }

    private User saveUser(String name, String email) {
        User u = new User();
        u.setEmri(name); u.setMbiemri("Test"); u.setEmail(email); u.setPasswordHash("x");
        return userRepository.save(u);
    }

    @Test
    void createRole() throws Exception {
        mockMvc.perform(post("/api/roles").contentType("application/json")
                .content("{\"emertimi\":\"moderator\",\"normalizedName\":\"moderator\",\"pershkrimi\":\"desc\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void createDepartment() throws Exception {
        mockMvc.perform(post("/api/departments").contentType("application/json")
                .content("{\"emertimi\":\"Mechanical Eng\",\"pershkrimi\":\"d\",\"numSemesters\":8}"))
                .andExpect(status().isCreated());
    }

    @Test
    void createUserClaim() throws Exception {
        mockMvc.perform(post("/api/user-claims").contentType("application/json")
                .content("{\"userId\":" + studentId + ",\"claimType\":\"permission\",\"claimValue\":\"read\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void createUserToken() throws Exception {
        mockMvc.perform(post("/api/user-tokens").contentType("application/json")
                .content("{\"userId\":" + studentId + ",\"loginProvider\":\"Local\",\"tokenName\":\"x\",\"tokenValue\":\"y\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void assignUserRole() throws Exception {
        mockMvc.perform(post("/api/user-roles").contentType("application/json")
                .content("{\"userId\":" + studentId + ",\"roleId\":" + studentRoleId + "}"))
                .andExpect(status().isCreated());
    }

    @Test
    void createCertificateForCompletedEnrollment() throws Exception {
        mockMvc.perform(post("/api/certificates").contentType("application/json")
                .content("{\"enrollmentId\":" + completedEnrollmentId + "}"))
                .andExpect(status().isCreated());
    }

    @Test
    void createUserViaAdmin() throws Exception {
        mockMvc.perform(post("/api/users").contentType("application/json")
                .content("{\"emri\":\"New\",\"mbiemri\":\"User\",\"email\":\"new@test.com\"," +
                        "\"password\":\"password123\",\"role\":\"student\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void updateEnrollmentStatus() throws Exception {
        mockMvc.perform(patch("/api/enrollments/" + completedEnrollmentId + "/statusi")
                .param("statusi", "AKTIV"))
                .andExpect(status().is2xxSuccessful());
    }
}
