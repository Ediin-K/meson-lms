package com.meson.dto;

import com.meson.entity.AttendanceStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRosterEntryResponse {
    private Long studentId;
    private String studentName;
    private AttendanceStatus status;
    private String comment;
}
