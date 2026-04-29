package com.meson.dto;

import com.meson.entity.AssignmentStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequest {

    @NotBlank(message = "Titulli nuk mund te jet bosh")
    private String titulli;

    private String pershkrimi;

    private String resourceUrl;

    @NotNull(message = "Deadline nuk mund te jet bosh")
    @Future(message = "Deadline duhet te jet ne te ardhmen")
    private LocalDateTime deadline;

    @Builder.Default
    private AssignmentStatus statusi = AssignmentStatus.AKTIV;

    @NotNull(message = "LessonId nuk mund te jet bosh")
    private Long lessonId;
}