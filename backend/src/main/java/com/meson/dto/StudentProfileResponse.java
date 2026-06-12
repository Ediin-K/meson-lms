package com.meson.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileResponse {
    private Long id;
    private String emri;
    private String mbiemri;
    private String email;
    private String phoneNumber;
    private String statusi;
    private LocalDateTime dataKrijimit;
    private String role;
    private Integer currentSemester;
    private String categoryName;
    private String parentName;
    private LocalDate dateOfBirth;
    private String gender;
    private String birthplace;
    private String academicYear;
}
