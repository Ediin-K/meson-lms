package com.meson.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TeacherStatsDTO {
    private long totalSubjects;
    private long totalStudents;
    private long totalQuizzes;
    private long totalAssignments;
}
