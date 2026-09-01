package com.meson.dto;

import com.meson.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttendanceMarkRequest {

    @NotNull(message = "studentId nuk mund te jete bosh")
    private Long studentId;

    @NotNull(message = "status nuk mund te jete bosh")
    private AttendanceStatus status;

    private String comment;
}
