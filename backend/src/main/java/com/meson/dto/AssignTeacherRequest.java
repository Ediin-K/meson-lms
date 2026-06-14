package com.meson.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AssignTeacherRequest {
    @NotNull(message = "subjectId nuk mund të jetë null")
    private Long subjectId;

    @NotNull(message = "teacherId nuk mund të jetë null")
    private Long teacherId;
}
