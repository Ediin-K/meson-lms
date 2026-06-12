package com.meson;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Confirms newly-protected admin write endpoints reject a STUDENT principal. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "student@test.com", roles = "STUDENT")
class AdminAuthorizationTest {

    @Autowired MockMvc mockMvc;

    @Test
    void studentCannotCreateRole() throws Exception {
        mockMvc.perform(post("/api/roles").contentType("application/json")
                .content("{\"emertimi\":\"x\",\"normalizedName\":\"x\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentCannotCreateDepartment() throws Exception {
        mockMvc.perform(post("/api/departments").contentType("application/json")
                .content("{\"emertimi\":\"Dept\",\"numSemesters\":8}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentCannotDeleteCertificate() throws Exception {
        mockMvc.perform(delete("/api/certificates/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentCannotAssignUserRole() throws Exception {
        mockMvc.perform(post("/api/user-roles").contentType("application/json")
                .content("{\"userId\":1,\"roleId\":1}"))
                .andExpect(status().isForbidden());
    }
}
