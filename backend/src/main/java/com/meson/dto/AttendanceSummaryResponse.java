package com.meson.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSummaryResponse {
    private List<AttendanceRecordResponse> records;
    private int totalSessions;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private int excusedCount;
    private double presentPercentage;
}
