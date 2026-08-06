package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcademicTermRequest {

    @NotBlank(message = "Emri nuk mund te jete bosh")
    private String name;

    @NotNull(message = "Fillimi i regjistrimit eshte i detyrueshem")
    private LocalDateTime enrollmentStart;

    @NotNull(message = "Mbarimi i regjistrimit eshte i detyrueshem")
    private LocalDateTime enrollmentEnd;

    @NotNull(message = "Fillimi i paraqitjes se provimeve eshte i detyrueshem")
    private LocalDateTime examApplicationStart;

    @NotNull(message = "Mbarimi i paraqitjes se provimeve eshte i detyrueshem")
    private LocalDateTime examApplicationEnd;
}
