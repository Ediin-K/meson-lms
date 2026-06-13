package com.meson.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamGradeRequest {
    @NotNull(message = "Nota eshte e detyrueshme")
    @Min(value = 5, message = "Nota minimale eshte 5")
    @Max(value = 10, message = "Nota maksimale eshte 10")
    private Integer grade;

    private String comment;
}
