package com.meson.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmissionRequest {

    @NotNull(message = "AssignmentId nuk mund te jet bosh")
    private Long assignmentId;

    @NotNull(message = "StudentId nuk mund te jet bosh")
    private Long studentId;

    private String submissionUrl;

    private String pershkrimi;
}