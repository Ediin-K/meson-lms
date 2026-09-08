package com.meson;

import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Every hasRole(...) check in the app keys off a role's normalized name, so the
 * baseline roles (ADMIN / TEACHER / STUDENT / DEPARTMENT_HEAD) must not be
 * renamable or deletable. Also covers the "custom role still has users" guard and
 * that the role endpoints are admin-only.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoleProtectionTest {

    private static final String CUSTOM_ROLE = "rp-custom-role";
    private static final String CUSTOM_USER_EMAIL = "roleprotection.user@test.com";

    @Autowired MockMvc mockMvc;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRepository userRepository;
    @Autowired UserRoleRepository userRoleRepository;

    private Role studentRole;

    @BeforeEach
    void setUp() {
        cleanUp();
        studentRole = ensureRole("student", "STUDENT");
        ensureRole("admin", "ADMIN");
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        userRepository.findByEmail(CUSTOM_USER_EMAIL).ifPresent(u -> {
            userRoleRepository.deleteAll(userRoleRepository.findByUser(u));
            userRepository.delete(u);
        });
        roleRepository.findByEmertimi(CUSTOM_ROLE).ifPresent(r -> {
            userRoleRepository.deleteAll(userRoleRepository.findByRole(r));
            roleRepository.delete(r);
        });
    }

    private Role ensureRole(String emertimi, String normalized) {
        return roleRepository.findByEmertimi(emertimi).orElseGet(() ->
                roleRepository.save(Role.builder()
                        .emertimi(emertimi)
                        .pershkrimi(emertimi)
                        .normalizedName(normalized)
                        .build()));
    }

    // ── Baseline roles are protected ──────────────────────────────────────

    @Test
    @WithMockUser(username = "rp.admin@test.com", roles = "ADMIN")
    void baselineRoleCannotBeRenamed() throws Exception {
        String body = "{\"emertimi\":\"student\",\"normalizedName\":\"PUPIL\",\"pershkrimi\":\"x\"}";
        mockMvc.perform(put("/api/roles/" + studentRole.getId())
                        .contentType("application/json").content(body))
                .andExpect(status().isBadRequest());

        assertThat(roleRepository.findById(studentRole.getId()).orElseThrow().getNormalizedName())
                .isEqualTo("STUDENT");
    }

    @Test
    @WithMockUser(username = "rp.admin@test.com", roles = "ADMIN")
    void baselineRoleDescriptionStaysEditable() throws Exception {
        // Same emertimi + normalizedName (renaming the normalized name is what's
        // blocked); only the description changes.
        String body = "{\"emertimi\":\"student\",\"normalizedName\":\"STUDENT\",\"pershkrimi\":\"Perdorues student\"}";
        mockMvc.perform(put("/api/roles/" + studentRole.getId())
                        .contentType("application/json").content(body))
                .andExpect(status().isOk());

        Role reloaded = roleRepository.findById(studentRole.getId()).orElseThrow();
        assertThat(reloaded.getNormalizedName()).isEqualTo("STUDENT");
        assertThat(reloaded.getPershkrimi()).isEqualTo("Perdorues student");
    }

    @Test
    @WithMockUser(username = "rp.admin@test.com", roles = "ADMIN")
    void baselineRoleCannotBeDeleted() throws Exception {
        mockMvc.perform(delete("/api/roles/" + studentRole.getId()))
                .andExpect(status().isBadRequest());

        assertThat(roleRepository.findById(studentRole.getId())).isPresent();
    }

    // ── Custom-role delete guard ──────────────────────────────────────────

    @Test
    @WithMockUser(username = "rp.admin@test.com", roles = "ADMIN")
    void customRoleWithUsersCannotBeDeleted() throws Exception {
        Role custom = ensureRole(CUSTOM_ROLE, "RP_CUSTOM_ROLE");
        User u = new User();
        u.setEmri("Role"); u.setMbiemri("Protection");
        u.setEmail(CUSTOM_USER_EMAIL); u.setPasswordHash("x");
        u = userRepository.save(u);
        userRoleRepository.save(UserRole.builder().user(u).role(custom).build());

        mockMvc.perform(delete("/api/roles/" + custom.getId()))
                .andExpect(status().isBadRequest());

        assertThat(roleRepository.findByEmertimi(CUSTOM_ROLE)).isPresent();
    }

    @Test
    @WithMockUser(username = "rp.admin@test.com", roles = "ADMIN")
    void emptyCustomRoleCanBeDeleted() throws Exception {
        Role custom = ensureRole(CUSTOM_ROLE, "RP_CUSTOM_ROLE");

        mockMvc.perform(delete("/api/roles/" + custom.getId()))
                .andExpect(status().isNoContent());

        assertThat(roleRepository.findByEmertimi(CUSTOM_ROLE)).isEmpty();
    }

    // ── Endpoint is admin-only ────────────────────────────────────────────

    @Test
    @WithMockUser(username = "rp.student@test.com", roles = "STUDENT")
    void nonAdminCannotUpdateRoles() throws Exception {
        mockMvc.perform(put("/api/roles/" + studentRole.getId())
                        .contentType("application/json")
                        .content("{\"emertimi\":\"x\",\"normalizedName\":\"X\",\"pershkrimi\":\"x\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "rp.student@test.com", roles = "STUDENT")
    void nonAdminCannotDeleteRoles() throws Exception {
        mockMvc.perform(delete("/api/roles/" + studentRole.getId()))
                .andExpect(status().isForbidden());
    }
}
