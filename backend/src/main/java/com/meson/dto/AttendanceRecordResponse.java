package com.meson.dto;

import com.meson.entity.AttendanceStatus;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecordResponse {
    private Long id;
    private LocalDate sessionDate;
    private String subjectTitulli;
    private AttendanceStatus status;
    private String comment;
}
