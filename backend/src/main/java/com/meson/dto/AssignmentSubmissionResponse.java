package com.meson.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private LocalDateTime deadline;
    private Long lessonId;
    private String lessonTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String fileName;
    private LocalDateTime submittedAt;
}
