package com.meson;

import com.meson.entity.Department;
import com.meson.entity.Role;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Covers the Phase D endpoint: POST /api/users/bulk-import (admin-only, CSV upload). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BulkImportControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRepository userRepository;
    @Autowired UserService userService;

    private String departmentName;
    private Long departmentId;
    private final List<String> createdEmails = new ArrayList<>();

    @BeforeEach
    void setUp() {
        if (roleRepository.findByEmertimi("student").isEmpty()) {
            Role role = new Role();
            role.setEmertimi("student");
            role.setNormalizedName("student");
            roleRepository.save(role);
        }

        departmentName = "Informatike-Ctrl-" + System.nanoTime();
        departmentId = departmentRepository.save(Department.builder()
                .emertimi(departmentName)
                .numSemesters(6)
                .build()).getId();
    }

    @AfterEach
    void tearDown() {
        for (String email : createdEmails) {
            userRepository.findByEmail(email).ifPresent(u -> userService.delete(u.getId()));
        }
        departmentRepository.deleteById(departmentId);
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void bulkImportProcessesEveryRowIndependently() throws Exception {
        String goodEmail1 = "bulkctrl" + System.nanoTime() + "@test.com";
        String goodEmail2 = "bulkctrl" + (System.nanoTime() + 1) + "@test.com";
        String badEmail = "bulkctrl" + (System.nanoTime() + 2) + "@test.com";
        createdEmails.add(goodEmail1);
        createdEmails.add(goodEmail2);

        String csv = "emri,mbiemri,email,role,department,semester\n"
                + "Ana,Krasniqi," + goodEmail1 + ",student," + departmentName + ",1\n"
                + "Beni,Hoxha," + goodEmail2 + ",student," + departmentName + ",2\n"
                + "Cara,Doe," + badEmail + ",student,NonexistentDept,1\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "students.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/users/bulk-import").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRows").value(3))
                .andExpect(jsonPath("$.successCount").value(2))
                .andExpect(jsonPath("$.failureCount").value(1))
                .andExpect(jsonPath("$.failures[0].row.email").value(badEmail))
                .andExpect(jsonPath("$.failures[0].errorMessage").value(containsString("NonexistentDept")))
                .andExpect(jsonPath("$.credentials.length()").value(2))
                .andExpect(jsonPath("$.credentials[0].email").value(goodEmail1))
                .andExpect(jsonPath("$.credentials[0].tempPassword").isNotEmpty())
                .andExpect(jsonPath("$.credentials[1].email").value(goodEmail2));
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "STUDENT")
    void bulkImportRejectsNonAdmin() throws Exception {
        String csv = "emri,mbiemri,email,role,department,semester\n"
                + "Ana,Krasniqi,ana@test.com,student," + departmentName + ",1\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "students.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/users/bulk-import").file(file))
                .andExpect(status().isForbidden());
    }
}
