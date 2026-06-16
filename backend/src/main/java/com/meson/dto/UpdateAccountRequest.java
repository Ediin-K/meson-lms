package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateAccountRequest {
    @NotBlank(message = "Emri është i detyrueshëm")
    @Size(max = 100)
    private String emri;

    @NotBlank(message = "Mbiemri është i detyrueshëm")
    @Size(max = 100)
    private String mbiemri;

    @Size(max = 30, message = "Numri i telefonit nuk mund të kalojë 30 karaktere")
    private String phoneNumber;
}
