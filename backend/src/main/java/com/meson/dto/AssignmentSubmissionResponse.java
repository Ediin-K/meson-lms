package com.meson.dto;

import lombok.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Instant deadline;
    private Long lessonId;
    private String lessonTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String fileName;
    private Instant submittedAt;
    private Instant firstSubmittedAt;
    private boolean late;
    private Double grade;
    private String feedback;
    private Instant gradedAt;
    /** NOT_SUBMITTED | SUBMITTED | LATE | GRADED */
    private String status;
}
