package com.meson.service;

import com.meson.dto.BulkImportRowDTO;
import com.meson.dto.BulkImportRowResult;
import com.meson.dto.CreateUserDTO;
import com.meson.entity.Department;
import com.meson.entity.User;
import com.meson.exception.BadRequestException;
import com.meson.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.Reader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkImportService {

    private static final String PASSWORD_ALPHABET =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final int PASSWORD_LENGTH = 12;
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final List<String> REQUIRED_CSV_HEADERS =
            List.of("emri", "mbiemri", "email", "role", "department", "semester");

    private final UserService userService;
    private final DepartmentRepository departmentRepository;
    private final EmailService emailService;

    public String generateTempPassword() {
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            password.append(PASSWORD_ALPHABET.charAt(RANDOM.nextInt(PASSWORD_ALPHABET.length())));
        }
        return password.toString();
    }

    public BulkImportRowResult importRow(BulkImportRowDTO row) {
        try {
            CreateUserDTO createUserDTO = new CreateUserDTO();
            createUserDTO.setEmri(row.getEmri());
            createUserDTO.setMbiemri(row.getMbiemri());
            createUserDTO.setEmail(row.getEmail());
            createUserDTO.setRole(row.getRole());
            createUserDTO.setCurrentSemester(row.getSemester());
            createUserDTO.setPassword(generateTempPassword());

            if (row.getDepartment() != null && !row.getDepartment().isBlank()) {
                Department department = departmentRepository.findByEmertimi(row.getDepartment())
                        .orElseThrow(() -> new RuntimeException("Departamenti nuk u gjet: " + row.getDepartment()));
                createUserDTO.setDepartmentId(department.getId());
            }

            User createdUser = userService.create(createUserDTO);

            try {
                emailService.sendTempPasswordEmail(createdUser, createUserDTO.getPassword());
            } catch (RuntimeException emailException) {
                return BulkImportRowResult.accountCreatedEmailFailed(row, createdUser.getId(), emailException.getMessage());
            }

            return BulkImportRowResult.success(row, createdUser.getId());
        } catch (RuntimeException e) {
            return BulkImportRowResult.failure(row, e.getMessage());
        }
    }

    public List<BulkImportRowDTO> parseCsv(MultipartFile file) {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setTrim(true)
                .setIgnoreSurroundingSpaces(true)
                .build();

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = format.parse(reader)) {

            for (String requiredHeader : REQUIRED_CSV_HEADERS) {
                if (!parser.getHeaderNames().contains(requiredHeader)) {
                    throw new BadRequestException("Kolona e kerkuar mungon ne CSV: " + requiredHeader);
                }
            }

            List<BulkImportRowDTO> rows = new ArrayList<>();
            for (CSVRecord record : parser) {
                rows.add(toRow(record));
            }
            return rows;
        } catch (IOException e) {
            throw new BadRequestException("Nuk u lexua dot skedari CSV: " + e.getMessage());
        }
    }

    private BulkImportRowDTO toRow(CSVRecord record) {
        BulkImportRowDTO row = new BulkImportRowDTO();
        row.setEmri(record.get("emri"));
        row.setMbiemri(record.get("mbiemri"));
        row.setEmail(record.get("email"));
        row.setRole(record.get("role"));

        String department = record.get("department");
        row.setDepartment(department == null || department.isBlank() ? null : department);

        String semester = record.get("semester");
        if (semester != null && !semester.isBlank()) {
            try {
                row.setSemester(Integer.parseInt(semester.trim()));
            } catch (NumberFormatException e) {
                row.setSemester(null);
            }
        }

        return row;
    }
}
