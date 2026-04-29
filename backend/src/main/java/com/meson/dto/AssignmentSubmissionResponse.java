package com.meson.dto;

import com.meson.entity.SubmissionStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitulli;
    private Long studentId;
    private String studentEmri;
    private String submissionUrl;
    private String pershkrimi;
    private Double nota;
    private SubmissionStatus statusi;
    private LocalDateTime submittedAt;
}