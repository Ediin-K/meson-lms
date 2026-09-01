package com.meson.dto;

import lombok.*;

/** One student's attendance tally across a single department's subjects. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentAttendanceStudentRow {
    private Long studentId;
    private String studentName;
    private int totalSessions;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private int excusedCount;
    private double presentPercentage;
}
