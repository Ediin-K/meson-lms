package com.meson;

import com.meson.dto.BulkImportRowDTO;
import com.meson.dto.BulkImportRowResult;
import com.meson.entity.Department;
import com.meson.entity.Role;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.RoleRepository;
import com.meson.service.BulkImportService;
import com.meson.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

/**
 * Covers the Phase F design decision: when account creation succeeds but the
 * notification email fails to send, the row must be distinguishable from a real
 * creation failure - userId stays populated and the reason is spelled out.
 * mail.enabled is forced on just for this test class (default is off everywhere else).
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = "mail.enabled=true")
class BulkImportEmailTest {

    @Autowired BulkImportService bulkImportService;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserService userService;

    @MockitoBean
    JavaMailSender mailSender;

    private String departmentName;
    private Long departmentId;
    private final List<Long> createdUserIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        if (roleRepository.findByEmertimi("student").isEmpty()) {
            Role role = new Role();
            role.setEmertimi("student");
            role.setNormalizedName("student");
            roleRepository.save(role);
        }

        departmentName = "Informatike-Email-" + System.nanoTime();
        departmentId = departmentRepository.save(Department.builder()
                .emertimi(departmentName)
                .numSemesters(6)
                .build()).getId();
    }

    @AfterEach
    void tearDown() {
        for (Long userId : createdUserIds) {
            userService.delete(userId);
        }
        departmentRepository.deleteById(departmentId);
    }

    @Test
    void accountIsCreatedEvenWhenEmailSendingFails() {
        doThrow(new MailSendException("smtp refused")).when(mailSender).send(any(SimpleMailMessage.class));

        BulkImportRowDTO row = new BulkImportRowDTO();
        row.setEmri("Email");
        row.setMbiemri("Fail");
        row.setEmail("emailfail" + System.nanoTime() + "@test.com");
        row.setRole("student");
        row.setDepartment(departmentName);
        row.setSemester(1);

        BulkImportRowResult result = bulkImportService.importRow(row);
        assertThat(result.getUserId()).isNotNull();
        createdUserIds.add(result.getUserId());

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorMessage()).contains("smtp refused");
        assertThat(result.getErrorMessage()).contains("Llogaria u krijua");
    }
}
