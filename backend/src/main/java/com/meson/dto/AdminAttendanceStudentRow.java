package com.meson.dto;

import lombok.*;

/** One student's attendance tally within one department's subjects, for the admin-wide view. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAttendanceStudentRow {
    private Long studentId;
    private String studentName;
    private Long departmentId;
    private String departmentName;
    private int totalSessions;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private int excusedCount;
    private double presentPercentage;
}
