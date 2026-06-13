package com.meson.dto;

import lombok.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssignmentOverviewResponse {
    private Long assignmentId;
    private String title;
    private Long subjectId;
    private String subjectTitle;
    private Long lessonId;
    private String lessonTitle;
    private Instant deadline;
    /** UPCOMING | MISSED | SUBMITTED | LATE | GRADED */
    private String status;
    private Instant submittedAt;
    private Double grade;
    private String feedback;
}
