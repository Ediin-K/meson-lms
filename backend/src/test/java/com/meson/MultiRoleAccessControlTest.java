package com.meson;

import com.meson.entity.Department;
import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.RoleRepository;
import com.meson.repository.StudentProfileRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * One account may hold several roles at once. The JWT carries all of them, so a
 * single login authenticates for every one of the user's roles' endpoints.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MultiRoleAccessControlTest {

    private static final String EMAIL = "multirole@test.com";
    private static final String PASSWORD = "password123";
    private static final String ADMIN_EMAIL = "multirole.admin@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRoleRepository userRoleRepository;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired StudentProfileRepository studentProfileRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private User multiRoleUser;
    private Department department;

    @BeforeEach
    void setUp() {
        cleanUp();

        multiRoleUser = newUser("Multi", EMAIL, passwordEncoder.encode(PASSWORD));
        userRoleRepository.save(UserRole.builder().user(multiRoleUser).role(role("teacher", "TEACHER")).build());
        userRoleRepository.save(UserRole.builder().user(multiRoleUser).role(role("department_head", "DEPARTMENT_HEAD")).build());

        User admin = newUser("Admin", ADMIN_EMAIL, "x");
        userRoleRepository.save(UserRole.builder().user(admin).role(role("admin", "ADMIN")).build());

        department = new Department();
        department.setEmertimi("MultiRole Dept " + System.nanoTime());
        department.setPershkrimi("desc");
        department.setNumSemesters(6);
        department.setHead(multiRoleUser);
        department = departmentRepository.save(department);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        departmentRepository.findAll().stream()
                .filter(d -> d.getEmertimi() != null && d.getEmertimi().startsWith("MultiRole Dept"))
                .forEach(d -> { d.setHead(null); departmentRepository.save(d); });
        departmentRepository.findAll().stream()
                .filter(d -> d.getEmertimi() != null && d.getEmertimi().startsWith("MultiRole Dept"))
                .forEach(departmentRepository::delete);
        for (String email : new String[]{EMAIL, ADMIN_EMAIL}) {
            userRepository.findByEmail(email).ifPresent(u -> {
                studentProfileRepository.findByUserId(u.getId()).ifPresent(studentProfileRepository::delete);
                userRoleRepository.deleteAll(userRoleRepository.findByUser(u));
                userRepository.delete(u);
            });
        }
    }

    private User newUser(String name, String email, String hash) {
        User u = new User();
        u.setEmri(name);
        u.setMbiemri("Test");
        u.setEmail(email);
        u.setPasswordHash(hash);
        return userRepository.save(u);
    }

    private Role role(String emertimi, String normalized) {
        return roleRepository.findByEmertimi(emertimi).orElseGet(() ->
                roleRepository.save(Role.builder()
                        .emertimi(emertimi)
                        .pershkrimi(emertimi)
                        .normalizedName(normalized)
                        .build()));
    }

    private Cookie loginAndGetAccessCookie() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(result2 -> {
                    String json = result2.getResponse().getContentAsString();
                    assertThat(json).contains("\"teacher\"");
                    assertThat(json).contains("\"department_head\"");
                })
                .andReturn();
        Cookie cookie = result.getResponse().getCookie("accessToken");
        assertThat(cookie).isNotNull();
        return cookie;
    }

    @Test
    void oneLoginAuthenticatesForEveryRolesEndpoints() throws Exception {
        Cookie access = loginAndGetAccessCookie();

        // teacher-only endpoint
        mockMvc.perform(get("/api/teacher/subjects").cookie(access))
                .andExpect(status().isOk());

        // department-head-only endpoint (the user heads `department`)
        mockMvc.perform(get("/api/department-head/dashboard").cookie(access))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminCanAssignMultipleRolesToOneUser() throws Exception {
        String body = "{\"emri\":\"Multi\",\"mbiemri\":\"Test\",\"email\":\"" + EMAIL + "\","
                + "\"statusi\":\"active\",\"roles\":[\"teacher\",\"department_head\"]}";
        mockMvc.perform(put("/api/users/" + multiRoleUser.getId())
                        .contentType("application/json").content(body))
                .andExpect(status().isOk());

        assertThat(userRoleRepository.findByUser(multiRoleUser))
                .extracting(ur -> ur.getRole().getEmertimi())
                .containsExactlyInAnyOrder("teacher", "department_head");
    }

    @Test
    @WithMockUser(username = ADMIN_EMAIL, roles = "ADMIN")
    void adminCanDropARoleFromAMultiRoleUser() throws Exception {
        String body = "{\"emri\":\"Multi\",\"mbiemri\":\"Test\",\"email\":\"" + EMAIL + "\","
                + "\"statusi\":\"active\",\"roles\":[\"department_head\"]}";
        mockMvc.perform(put("/api/users/" + multiRoleUser.getId())
                        .contentType("application/json").content(body))
                .andExpect(status().isOk());

        assertThat(userRoleRepository.findByUser(multiRoleUser))
                .extracting(ur -> ur.getRole().getEmertimi())
                .containsExactly("department_head");
    }
}
