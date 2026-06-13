package com.meson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamApplicationRequest {
    @NotNull(message = "Kursi eshte i detyrueshem")
    private Long courseId;

    @NotNull(message = "Profesori eshte i detyrueshem")
    private Long professorId;
}
