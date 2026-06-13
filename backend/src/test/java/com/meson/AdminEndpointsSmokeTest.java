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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Smoke test: every endpoint an admin page calls on load must respond 2xx for an
 * admin principal. Failures here mean a broken/blank admin page in the browser.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "admin@test.com", roles = "ADMIN")
class AdminEndpointsSmokeTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRoleRepository userRoleRepository;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired SubjectRepository subjectRepository;

    private Long departmentId;
    private Long studentUserId;

    @BeforeEach
    void setUp() {
        userRoleRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();
        departmentRepository.deleteAll();
        roleRepository.deleteAll();

        Role adminRole = saveRole("admin", "admin");
        Role studentRole = saveRole("student", "student");
        saveRole("teacher", "teacher");

        User admin = saveUser("Admin", "admin@test.com");
        User student = saveUser("Student", "student@test.com");
        studentUserId = student.getId();
        link(admin, adminRole);
        link(student, studentRole);

        Department dept = new Department();
        dept.setEmertimi("Computer Engineering");
        dept.setNumSemesters(8);
        dept = departmentRepository.save(dept);
        departmentId = dept.getId();

        Subject subject = new Subject();
        subject.setTitulli("Subject A");
        subject.setPershkrimi("desc");
        subject.setTeacher(admin);
        subject.setDepartment(dept);
        subject.setSemester(1);
        subject.setEcts(5);
        subject.setCreatedAt(LocalDateTime.now());
        subjectRepository.save(subject);
    }

    private Role saveRole(String emertimi, String normalized) {
        Role r = new Role();
        r.setEmertimi(emertimi);
        r.setNormalizedName(normalized);
        return roleRepository.save(r);
    }

    private User saveUser(String name, String email) {
        User u = new User();
        u.setEmri(name);
        u.setMbiemri("Test");
        u.setEmail(email);
        u.setPasswordHash("x");
        return userRepository.save(u);
    }

    private void link(User u, Role r) {
        userRoleRepository.save(UserRole.builder().user(u).role(r).build());
    }

    private void ok(String url) throws Exception {
        mockMvc.perform(get(url)).andExpect(status().is2xxSuccessful());
    }

    @Test
    void adminDashboardStats() throws Exception { ok("/api/admin/stats"); }

    @Test
    void adminReportsStats() throws Exception { ok("/api/admin/stats"); }

    @Test
    void adminUsersList() throws Exception {
        ok("/api/users/paged?page=0&size=20");
        ok("/api/users");
    }

    @Test
    void adminRolesList() throws Exception { ok("/api/roles"); }

    @Test
    void adminUserClaimsList() throws Exception { ok("/api/user-claims"); }

    @Test
    void adminUserTokensList() throws Exception { ok("/api/user-tokens"); }

    @Test
    void adminUserRolesForUser() throws Exception { ok("/api/user-roles/user/" + studentUserId); }

    @Test
    void adminDepartmentsList() throws Exception {
        ok("/api/departments");
        ok("/api/subject-departments");
    }

    @Test
    void adminSubjectsList() throws Exception { ok("/api/subjects"); }

    @Test
    void adminTeachersList() throws Exception { ok("/api/admin/teachers"); }

    @Test
    void adminEnrollmentsList() throws Exception {
        ok("/api/enrollments/paged?page=0&size=20");
        ok("/api/enrollments");
    }

    @Test
    void adminCertificatesList() throws Exception { ok("/api/certificates"); }

    @Test
    void adminSchedulesList() throws Exception { ok("/api/schedules"); }

    @Test
    void adminGroupRequestsList() throws Exception { ok("/api/admin/group-requests"); }

    @Test
    void adminDepartmentGroupsForDepartment() throws Exception {
        ok("/api/departments/" + departmentId + "/department-groups");
    }

    @Test
    void adminGroupWizardContext() throws Exception {
        ok("/api/admin/department-groups/wizard/context?departmentId=" + departmentId + "&semester=1");
    }
}
