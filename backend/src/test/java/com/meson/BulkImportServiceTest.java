package com.meson;

import com.meson.dto.BulkImportRowDTO;
import com.meson.dto.BulkImportRowResult;
import com.meson.entity.Department;
import com.meson.entity.Role;
import com.meson.exception.BadRequestException;
import com.meson.repository.DepartmentRepository;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.service.BulkImportService;
import com.meson.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class BulkImportServiceTest {

    @Autowired BulkImportService bulkImportService;
    @Autowired DepartmentRepository departmentRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRepository userRepository;
    @Autowired UserService userService;

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

        departmentName = "Informatike-" + System.nanoTime();
        departmentId = departmentRepository.save(Department.builder()
                .emertimi(departmentName)
                .numSemesters(6)
                .build()).getId();
    }

    // Other test classes sharing this H2 instance do a blanket userRepository.deleteAll()
    // in their own setUp(); a student_profiles row left behind by us would break that
    // with an FK violation, so we clean up everything we created. userService.delete()
    // (not a raw repository call) because it's @Transactional and already deletes the
    // profile before the user in the right order.
    @AfterEach
    void tearDown() {
        for (Long userId : createdUserIds) {
            userService.delete(userId);
        }
        departmentRepository.deleteById(departmentId);
    }

    @Test
    void generatedPasswordHasExpectedLength() {
        String password = bulkImportService.generateTempPassword();

        assertThat(password).hasSize(12);
    }

    @Test
    void generatedPasswordExcludesConfusableCharacters() {
        String password = bulkImportService.generateTempPassword();
        String confusableChars = "0Oo1lI";

        assertThat(password.chars()).noneMatch(c -> confusableChars.indexOf(c) >= 0);
    }

    @Test
    void generatedPasswordsAreNotAllIdentical() {
        long distinctCount = IntStream.range(0, 20)
                .mapToObj(i -> bulkImportService.generateTempPassword())
                .distinct()
                .count();

        assertThat(distinctCount).isEqualTo(20);
    }

    @Test
    void importRowCreatesAccountWithTemporaryPassword() {
        BulkImportRowDTO row = new BulkImportRowDTO();
        row.setEmri("Test");
        row.setMbiemri("Student");
        row.setEmail("bulkstudent" + System.nanoTime() + "@test.com");
        row.setRole("student");
        row.setDepartment(departmentName);
        row.setSemester(1);

        BulkImportRowResult result = bulkImportService.importRow(row);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getErrorMessage()).isNull();
        assertThat(result.getUserId()).isNotNull();
        createdUserIds.add(result.getUserId());

        var savedUser = userRepository.findById(result.getUserId()).orElseThrow();
        assertThat(savedUser.isTemporaryPassword()).isTrue();
        assertThat(savedUser.getEmail()).isEqualTo(row.getEmail());
    }

    @Test
    void importRowFailsOnDuplicateEmailWithoutThrowing() {
        String email = "dupe" + System.nanoTime() + "@test.com";

        BulkImportRowDTO row = new BulkImportRowDTO();
        row.setEmri("First");
        row.setMbiemri("Row");
        row.setEmail(email);
        row.setRole("student");
        row.setDepartment(departmentName);
        row.setSemester(1);

        BulkImportRowResult firstResult = bulkImportService.importRow(row);
        assertThat(firstResult.isSuccess()).isTrue();
        createdUserIds.add(firstResult.getUserId());

        BulkImportRowDTO duplicateRow = new BulkImportRowDTO();
        duplicateRow.setEmri("Second");
        duplicateRow.setMbiemri("Row");
        duplicateRow.setEmail(email);
        duplicateRow.setRole("student");
        duplicateRow.setDepartment(departmentName);
        duplicateRow.setSemester(1);

        BulkImportRowResult duplicateResult = bulkImportService.importRow(duplicateRow);

        assertThat(duplicateResult.isSuccess()).isFalse();
        assertThat(duplicateResult.getErrorMessage()).isNotBlank();
        assertThat(duplicateResult.getRow().getEmail()).isEqualTo(email);
    }

    @Test
    void importRowFailsOnUnknownDepartmentWithoutThrowing() {
        BulkImportRowDTO row = new BulkImportRowDTO();
        row.setEmri("No");
        row.setMbiemri("Department");
        row.setEmail("nodept" + System.nanoTime() + "@test.com");
        row.setRole("student");
        row.setDepartment("Nonexistent Department " + System.nanoTime());
        row.setSemester(1);

        BulkImportRowResult result = bulkImportService.importRow(row);

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorMessage()).contains("Nonexistent Department");
    }

    @Test
    void parseCsvReadsWellFormedRows() {
        String csv = "emri,mbiemri,email,role,department,semester\n"
                + "Ana,Krasniqi,ana" + System.nanoTime() + "@test.com,student," + departmentName + ",2\n"
                + "Beni,Hoxha,beni" + System.nanoTime() + "@test.com,teacher,,\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "students.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        List<BulkImportRowDTO> rows = bulkImportService.parseCsv(file);

        assertThat(rows).hasSize(2);
        assertThat(rows.get(0).getEmri()).isEqualTo("Ana");
        assertThat(rows.get(0).getDepartment()).isEqualTo(departmentName);
        assertThat(rows.get(0).getSemester()).isEqualTo(2);
        assertThat(rows.get(1).getDepartment()).isNull();
        assertThat(rows.get(1).getSemester()).isNull();
    }

    @Test
    void parseCsvRejectsFileMissingARequiredColumn() {
        String csv = "emri,mbiemri,email,role,semester\n"
                + "Ana,Krasniqi,ana@test.com,student,2\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "students.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> bulkImportService.parseCsv(file))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("department");
    }

    @Test
    void parseCsvTreatsUnparseableSemesterAsNullRatherThanFailingTheWholeFile() {
        String csv = "emri,mbiemri,email,role,department,semester\n"
                + "Ana,Krasniqi,ana@test.com,student," + departmentName + ",abc\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "students.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        List<BulkImportRowDTO> rows = bulkImportService.parseCsv(file);

        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).getSemester()).isNull();
    }
}
