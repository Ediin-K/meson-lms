package com.meson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentRequest {

    @NotNull(message = "UserId nuk mund te jet bosh")
    private Long userId;

    @NotNull(message = "SubjectId nuk mund te jet bosh")
    private Long subjectId;

    private Long subjectGroupId;

    private Long subjectSubgroupId;

    private String enrollmentKey;
}
