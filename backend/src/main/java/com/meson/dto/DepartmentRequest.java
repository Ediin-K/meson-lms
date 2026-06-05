package com.meson.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequest {

    @NotBlank(message="Emertimi nuk mund te jet bosh")
    @Size(min = 2, max = 100, message = "Emertimi duhet te jet 2-100 karaktere")
    private String emertimi;

    @Size(max = 500, message = "Pershkrimi nuk mund te kaloj 500 karaktere")
    private String pershkrimi;

    @NotNull(message = "Numri i semestrave është i detyrueshëm")
    @Min(value = 1, message = "Numri i semestrave duhet të jetë të paktën 1")
    @Max(value = 12, message = "Numri i semestrave nuk mund të kalojë 12")
    private Integer numSemesters;

}
